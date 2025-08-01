import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export type PredictionType = 'demand_forecast' | 'reorder_point' | 'expiry_alert' | 'cost_optimization';

@Entity('inventory_predictions')
export class InventoryPrediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'enum', enum: ['demand_forecast', 'reorder_point', 'expiry_alert', 'cost_optimization'] })
  predictionType: PredictionType;

  @Column({ type: 'int' })
  currentStock: number;

  @Column({ type: 'int' })
  predictedDemand: number; // Demanda prevista para próximos 30 dias

  @Column({ type: 'int' })
  recommendedReorderPoint: number;

  @Column({ type: 'int' })
  recommendedOrderQuantity: number;

  @Column({ type: 'json' })
  seasonalPatterns: any; // Padrões sazonais identificados

  @Column({ type: 'json' })
  costAnalysis: any; // Análise de custos

  @Column({ type: 'date', nullable: true })
  predictedStockoutDate: Date; // Data prevista de falta

  @CreateDateColumn()
  createdAt: Date;
}