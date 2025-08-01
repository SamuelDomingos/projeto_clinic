import { OFXTransaction } from '../types/ofx';

export const ofxService = {
  async parseOFX(content: string): Promise<OFXTransaction[]> {
    try {
      // Verifica se o conteúdo é um arquivo OFX válido
      if (!content.includes('OFXHEADER')) {
        throw new Error('Arquivo OFX inválido');
      }

      const transactions: OFXTransaction[] = [];
      let id = 1;

      // Log do conteúdo para debug
      console.log('Conteúdo do arquivo OFX:', content.substring(0, 1000));

      // Padrões para encontrar transações
      const patterns = [
        // Padrão 1: Transação com DTPOSTED, TRNAMT e MEMO
        /<STMTTRN>[\s\S]*?<DTPOSTED>(\d{8})[\s\S]*?<TRNAMT>([-\d.]+)[\s\S]*?<MEMO>([^<]+)[\s\S]*?<\/STMTTRN>/g,
        // Padrão 2: Transação com DTPOSTED e TRNAMT (sem MEMO)
        /<STMTTRN>[\s\S]*?<DTPOSTED>(\d{8})[\s\S]*?<TRNAMT>([-\d.]+)[\s\S]*?<\/STMTTRN>/g,
        // Padrão 3: Transação com FITID e TRNAMT
        /<STMTTRN>[\s\S]*?<FITID>([^<]+)[\s\S]*?<TRNAMT>([-\d.]+)[\s\S]*?<MEMO>([^<]+)[\s\S]*?<\/STMTTRN>/g,
        // Padrão 4: Transação com DTPOSTED e TRNAMT (formato alternativo)
        /<STMTTRN>[\s\S]*?<DTPOSTED>(\d{8})[^<]*<\/DTPOSTED>[\s\S]*?<TRNAMT>([-\d.]+)[^<]*<\/TRNAMT>[\s\S]*?<\/STMTTRN>/g
      ];

      // Função auxiliar para extrair transações de um bloco de texto
      const extractTransactions = (content: string) => {
        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const date = match[1] || match[3]; // Pode estar em diferentes posições
            const amount = parseFloat(match[2]);
            const description = match[3] || 'Transação sem descrição';

            if (date && !isNaN(amount)) {
              // Formatar a data (YYYYMMDD -> DD/MM/YYYY)
              const formattedDate = `${date.slice(6, 8)}/${date.slice(4, 6)}/${date.slice(0, 4)}`;

              // Determina o tipo baseado no valor
              const type = amount >= 0 ? 'revenue' : 'expense';

              // Adiciona a transação
              transactions.push({
                id: id.toString(),
                date: formattedDate,
                description: description.trim(),
                amount: Math.abs(amount), // Converte para positivo
                type,
                branch: '',
                category: ''
              });

              id++;
            }
          }
        }
      };

      // Tentar diferentes seções do arquivo OFX
      const sections = [
        // Seção 1: Conteúdo completo
        content,
        // Seção 2: Dentro de BANKTRANLIST
        content.match(/<BANKTRANLIST>([\s\S]*?)<\/BANKTRANLIST>/)?.[1] || '',
        // Seção 3: Dentro de STMTTRNRS
        content.match(/<STMTTRNRS>([\s\S]*?)<\/STMTTRNRS>/)?.[1] || '',
        // Seção 4: Dentro de STMTRS
        content.match(/<STMTRS>([\s\S]*?)<\/STMTRS>/)?.[1] || '',
        // Seção 5: Dentro de BANKMSGSRSV1
        content.match(/<BANKMSGSRSV1>([\s\S]*?)<\/BANKMSGSRSV1>/)?.[1] || ''
      ];

      // Tentar extrair transações de cada seção
      for (const section of sections) {
        if (section) {
          extractTransactions(section);
          if (transactions.length > 0) break;
        }
      }

      if (transactions.length === 0) {
        // Se não encontrou transações, tentar um último padrão mais genérico
        const genericPattern = content.match(/<STMTTRN>.*?<\/STMTTRN>/gs);
        if (genericPattern) {
          extractTransactions(content);
        }
      }

      if (transactions.length === 0) {
        // Log do conteúdo para debug
        console.log('Conteúdo do arquivo OFX:', content.substring(0, 1000));
        throw new Error('Nenhuma transação encontrada no arquivo OFX');
      }

      return transactions;
    } catch (error) {
      console.error('Erro ao processar arquivo OFX:', error);
      throw error;
    }
  }
}; 