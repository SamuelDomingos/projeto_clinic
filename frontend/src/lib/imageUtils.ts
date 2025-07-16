interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  type?: string;
}

export const compressImage = async (file: File, options: CompressOptions = {}): Promise<File> => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7,
    type = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      // Calcula as novas dimensões mantendo a proporção
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      // Cria um canvas para redimensionar a imagem
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      // Desenha a imagem redimensionada
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Não foi possível criar o contexto do canvas'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Converte para blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha ao comprimir a imagem'));
            return;
          }

          // Cria um novo arquivo com o blob comprimido
          const compressedFile = new File([blob], file.name, {
            type: type,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        type,
        quality
      );

      // Limpa a URL do objeto
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Falha ao carregar a imagem'));
    };
  });
}; 