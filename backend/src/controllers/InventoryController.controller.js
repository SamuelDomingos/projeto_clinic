const { Op } = require('sequelize');
const { Product, StockLocation, StockMovement, Supplier, User, Transaction } = require('../models');
const { validationResult } = require('express-validator');
const { sequelize } = require('sequelize');

class InventoryController {
  // Criar um novo produto
  static async createProduct(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { initialLocation, initialQuantity, initialExpiryDate, initialPrice, initialSku, initialSupplierId, ...productData } = req.body;
      const userId = req.user.id;

      const newProduct = await Product.create(productData);

      if (initialLocation && initialQuantity > 0) {
        await StockLocation.create({
          productId: newProduct.id,
          location: initialLocation,
          quantity: initialQuantity,
          price: initialPrice,
          sku: initialSku,
          expiryDate: initialExpiryDate || null
        });

        await StockMovement.create({
          productId: newProduct.id,
          supplierId: initialSupplierId,
          type: 'in',
          quantity: initialQuantity,
          reason: 'Estoque inicial',
          location: initialLocation,
          userId: userId,
          sku: initialSku,
          price: initialPrice,
          expiryDate: initialExpiryDate
        });
      }

      const productWithDetails = await Product.findByPk(newProduct.id, {
        include: [
          { 
            model: StockLocation,
            attributes: ['location', 'quantity', 'expiryDate', 'price', 'sku']
          }
        ]
      });

      res.status(201).json(productWithDetails);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Error creating product' });
    }
  }

  // Listar todos os produtos com suas localizações
  static async listProducts(req, res) {
    try {
      const products = await Product.findAll({
        include: [
          {
            model: StockLocation,
            attributes: ['location', 'quantity', 'expiryDate', 'price', 'sku']
          }
        ],
        where: {
          status: 'active'
        }
      });

      const productsWithFormattedLocations = await Promise.all(products.map(async (product) => {
        const formattedLocations = product.StockLocations.map(location => ({
          ...location.toJSON(),
          location: location.location
        }));

        const totalQuantity = formattedLocations.reduce((sum, loc) => sum + loc.quantity, 0);
        let inventoryStatus = 'normal';

        if (totalQuantity === 0) {
          inventoryStatus = 'out';
        } else if (totalQuantity <= product.minimumStock) {
          inventoryStatus = 'low';
        }

        const hasExpiring = formattedLocations.some(loc => {
          if (!loc.expiryDate) return false;
          const daysUntilExpiry = Math.ceil((new Date(loc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        });

        if (hasExpiring) {
          inventoryStatus = 'expiring';
        }

        return {
          ...product.toJSON(),
          totalQuantity,
          inventoryStatus,
          StockLocations: formattedLocations
        };
      }));

      res.json(productsWithFormattedLocations);
    } catch (error) {
      console.error('Error listing products:', error);
      res.status(500).json({ error: 'Error listing products' });
    }
  }

  // Adicionar estoque em uma localização
  static async addStock(req, res) {
    try {
      const { productId, location, quantity, expiryDate, price, sku, supplierId } = req.body;
      const userId = req.user.id;

      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Criar ou atualizar localização
      const [stockLocation, created] = await StockLocation.findOrCreate({
        where: { 
          productId, 
          location,
          sku
        },
        defaults: { 
          quantity: 0, 
          expiryDate: expiryDate || null,
          price
        }
      });

      if (!created) {
        stockLocation.quantity += quantity;
        if (expiryDate) {
          stockLocation.expiryDate = expiryDate;
        }
        await stockLocation.save();
      } else {
        stockLocation.quantity = quantity;
        await stockLocation.save();
      }

      await StockMovement.create({
        productId,
        supplierId,
        type: 'in',
        quantity,
        reason: 'Stock addition',
        location,
        userId,
        sku,
        price,
        expiryDate
      });

      // Criar transação de despesa
      if (price && quantity) {
        await Transaction.create({
          type: 'expense',
          amount: price * quantity,
          description: `Entrada de estoque: ${product.name} (${quantity} unidades)`,
          dueDate: new Date(),
          category: 'stock',
          paymentMethod: 'cash',
          status: 'completed',
          relatedEntityType: 'product',
          relatedEntityId: productId,
          createdBy: userId,
          updatedBy: userId
        });
      }

      res.json(stockLocation);
    } catch (error) {
      console.error('Error adding stock:', error);
      res.status(500).json({ error: 'Error adding stock' });
    }
  }

  // Remover estoque de uma localização
  static async removeStock(req, res) {
    try {
      const { productId, location, quantity, reason, sku } = req.body;
      const userId = req.user.id;

      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Construir a condição where base
      const whereCondition = { 
        productId, 
        location
      };

      // Adicionar sku à condição apenas se ele existir
      if (sku) {
        whereCondition.sku = sku;
      }

      const stockLocation = await StockLocation.findOne({
        where: whereCondition
      });

      if (!stockLocation || stockLocation.quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      // Encontrar o supplierId da última entrada de estoque
      const lastInMovement = await StockMovement.findOne({
        where: {
          productId,
          location,
          type: 'in'
        },
        order: [['createdAt', 'DESC']]
      });

      stockLocation.quantity -= quantity;
      await stockLocation.save();

      await StockMovement.create({
        productId,
        type: 'out',
        quantity,
        reason,
        location,
        userId,
        sku: stockLocation.sku,
        price: stockLocation.price,
        expiryDate: stockLocation.expiryDate,
        supplierId: lastInMovement?.supplierId
      });

      res.json(stockLocation);
    } catch (error) {
      console.error('Error removing stock:', error);
      res.status(500).json({ error: 'Error removing stock' });
    }
  }

  // Transferir estoque entre localizações
  static async transferStock(req, res) {
    try {
      const { productId, fromLocation, toLocation, quantity, reason } = req.body;
      const userId = req.user.id;

      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const fromStock = await StockLocation.findOne({
        where: { 
          productId, 
          location: fromLocation
        }
      });

      if (!fromStock || fromStock.quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock in source location' });
      }

      let toStock = await StockLocation.findOne({
        where: { 
          productId, 
          location: toLocation
        }
      });

      if (!toStock) {
        toStock = await StockLocation.create({
          productId,
          location: toLocation,
          quantity: 0,
          price: fromStock.price,
          sku: fromStock.sku,
          expiryDate: fromStock.expiryDate
        });
      }

      fromStock.quantity -= quantity;
      toStock.quantity += quantity;
      await fromStock.save();
      await toStock.save();

      if (fromStock.quantity <= 0) {
        await fromStock.destroy();
      }

      // Encontrar o supplierId da última entrada de estoque
      const lastInMovement = await StockMovement.findOne({
        where: {
          productId,
          location: fromLocation,
          type: 'in'
        },
        order: [['createdAt', 'DESC']]
      });

      // Criar a movimentação usando o supplierId da última entrada
      await StockMovement.create({
        productId,
        type: 'transfer',
        quantity,
        reason,
        location: `${fromLocation} -> ${toLocation}`,
        userId,
        sku: fromStock.sku || null,
        price: fromStock.price || null,
        expiryDate: fromStock.expiryDate || null,
        supplierId: lastInMovement?.supplierId
      });

      res.json({ fromStock, toStock });
    } catch (error) {
      console.error('Error transferring stock:', error);
      res.status(500).json({ error: 'Error transferring stock' });
    }
  }

  // Listar movimentações de um produto
  static async listMovements(req, res) {
    try {
      const { productId } = req.params;
      const movements = await StockMovement.findAll({
        where: { productId },
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Product,
            attributes: ['name']
          },
          {
            model: User,
            attributes: ['name']
          },
          {
            model: Supplier,
            attributes: ['name']
          }
        ]
      });

      const formattedMovements = movements.map(movement => ({
        ...movement.toJSON(),
        product: movement.Product ? movement.Product.toJSON() : null,
        user: movement.User ? movement.User.toJSON() : null,
        supplier: movement.Supplier ? movement.Supplier.toJSON() : null
      }));

      res.json(formattedMovements);
    } catch (error) {
      console.error('Error listing movements:', error);
      res.status(500).json({ error: 'Error listing movements' });
    }
  }

  // Deletar uma movimentação
  static async deleteMovement(req, res) {
    try {
      const { movementId } = req.params;

      // Buscar a movimentação
      const movement = await StockMovement.findByPk(movementId);
      if (!movement) {
        return res.status(404).json({ error: 'Movement not found' });
      }

      // Verificar se a movimentação é recente (menos de 24 horas)
      const movementDate = new Date(movement.createdAt);
      const now = new Date();
      const hoursDiff = (now - movementDate) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        return res.status(400).json({ error: 'Movements can only be deleted within 24 hours' });
      }

      // Reverter a movimentação
      const location = movement.location.split(' -> ')[0]; // Pegar a localização original
      const stockLocation = await StockLocation.findOne({
        where: { 
          productId: movement.productId,
          location: location
        }
      });

      if (stockLocation) {
        if (movement.type === 'in') {
          stockLocation.quantity -= movement.quantity;
        } else if (movement.type === 'out') {
          stockLocation.quantity += movement.quantity;
        }
        await stockLocation.save();

        // Se a quantidade ficar 0, deletar a localização
        if (stockLocation.quantity <= 0) {
          await stockLocation.destroy();
        }
      }

      // Deletar a movimentação
      await movement.destroy();

      res.json({ message: 'Movement deleted successfully' });
    } catch (error) {
      console.error('Error deleting movement:', error);
      res.status(500).json({ error: 'Error deleting movement' });
    }
  }

  // Atualizar movimentação
  static async updateMovement(req, res) {
    try {
      const { movementId } = req.params;
      const { quantity, location, reason } = req.body;

      // Verificar se a movimentação existe
      const movement = await StockMovement.findByPk(movementId, {
        include: [
          { model: Product },
          { model: User }
        ]
      });

      if (!movement) {
        return res.status(404).json({ error: 'Movement not found' });
      }

      // Verificar se a movimentação é recente (menos de 24 horas)
      const movementDate = new Date(movement.createdAt);
      const now = new Date();
      const hoursDiff = (now - movementDate) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        return res.status(400).json({ error: 'Can only edit movements within 24 hours' });
      }

      // Reverter a quantidade antiga
      const oldStockLocation = await StockLocation.findOne({
        where: { 
          productId: movement.productId,
          location: movement.location.split(' -> ')[0] // Pegar a localização original
        }
      });

      if (oldStockLocation) {
        // Reverter a quantidade antiga
        if (movement.type === 'in') {
          oldStockLocation.quantity -= movement.quantity;
        } else if (movement.type === 'out') {
          oldStockLocation.quantity += movement.quantity;
        }
        await oldStockLocation.save();

        // Se a quantidade ficar 0, deletar a localização
        if (oldStockLocation.quantity <= 0) {
          await oldStockLocation.destroy();
        }
      }

      // Verificar se a nova localização já existe
      let newStockLocation = await StockLocation.findOne({
        where: { 
          productId: movement.productId,
          location: location
        }
      });

      if (!newStockLocation) {
        // Criar nova localização com a data de validade da localização antiga
        newStockLocation = await StockLocation.create({
          productId: movement.productId,
          location: location,
          quantity: 0,
          expiryDate: oldStockLocation?.expiryDate
        });
      }

      // Aplicar a nova quantidade
      if (movement.type === 'in') {
        newStockLocation.quantity += quantity;
      } else if (movement.type === 'out') {
        newStockLocation.quantity -= quantity;
      }
      await newStockLocation.save();

      // Atualizar a movimentação
      movement.quantity = quantity;
      movement.location = location;
      movement.reason = reason;
      await movement.save();

      // Buscar a movimentação atualizada com os detalhes
      const updatedMovement = await StockMovement.findByPk(movementId, {
        include: [
          { model: Product },
          { model: User }
        ]
      });

      res.json(updatedMovement);
    } catch (error) {
      console.error('Error updating movement:', error);
      res.status(500).json({ error: 'Error updating movement' });
    }
  }

  // Buscar um produto específico
  static async getProduct(req, res) {
    try {
      const { id } = req.params;

      await StockLocation.destroy({
        where: {
          productId: id,
          quantity: 0
        }
      });

      const product = await Product.findByPk(id, {
        include: [
          {
            model: StockLocation,
            as: 'StockLocations',
            attributes: ['location', 'quantity', 'expiryDate', 'price', 'sku'],
            where: {
              quantity: {
                [Op.gt]: 0
              }
            }
          },
          {
            model: StockMovement,
            as: 'movements',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['name']
              },
              {
                model: Supplier,
                attributes: ['name']
              }
            ],
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const totalQuantity = product.StockLocations.reduce((sum, loc) => sum + loc.quantity, 0);
      product.totalQuantity = totalQuantity;

      if (totalQuantity <= 0) {
        product.inventoryStatus = 'out';
      } else if (totalQuantity <= product.minimumStock) {
        product.inventoryStatus = 'low';
      } else {
        product.inventoryStatus = 'normal';
      }

      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Error fetching product' });
    }
  }
}

module.exports = InventoryController; 