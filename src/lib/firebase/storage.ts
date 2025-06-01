// src/lib/firebase/storage.ts - UPDATED with public/private support
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject,
    listAll 
  } from 'firebase/storage';
  import { auth } from './config';
  
  const storage = getStorage();
  
  /**
   * Upload payment proof image (PRIVATE)
   * Structure: payments/{saleId}/{timestamp}_{filename}
   */
  export const uploadPaymentProof = async (
    file: File, 
    saleId: string, 
    uploadedBy: string
  ): Promise<string> => {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Solo se permiten archivos de imagen (JPG, PNG, WEBP)');
      }
  
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('El archivo no puede ser mayor a 5MB');
      }
  
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${uploadedBy.slice(0, 8)}.${fileExtension}`;
      
      // Create storage reference (PRIVATE path)
      const storageRef = ref(storage, `payments/${saleId}/${fileName}`);
      
      // Add metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy,
          uploadedAt: new Date().toISOString(),
          saleId,
          originalName: file.name,
          visibility: 'private'
        }
      };
  
      // Upload file
      const snapshot = await uploadBytes(storageRef, file, metadata);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      throw error;
    }
  };
  
  /**
   * Upload public media (for website use)
   * Structure: public/{category}/{filename}
   */
  export const uploadPublicMedia = async (
    file: File,
    category: 'images' | 'videos' | 'assets' | 'testimonials' = 'images',
    customName?: string
  ): Promise<string> => {
    try {
      // Validate file type based on category
      let allowedTypes: string[];
      let maxSize: number;
  
      switch (category) {
        case 'images':
        case 'testimonials':
          allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          maxSize = 10 * 1024 * 1024; // 10MB for images
          break;
        case 'videos':
          allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
          maxSize = 100 * 1024 * 1024; // 100MB for videos
          break;
        case 'assets':
          allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
          maxSize = 5 * 1024 * 1024; // 5MB for assets
          break;
        default:
          allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          maxSize = 10 * 1024 * 1024;
      }
  
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de archivo no permitido para ${category}. Permitidos: ${allowedTypes.join(', ')}`);
      }
  
      if (file.size > maxSize) {
        const sizeMB = Math.round(maxSize / (1024 * 1024));
        throw new Error(`El archivo es demasiado grande. Máximo: ${sizeMB}MB`);
      }
  
      // Create filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = customName 
        ? `${customName}.${fileExtension}`
        : `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Create storage reference (PUBLIC path)
      const storageRef = ref(storage, `public/${category}/${fileName}`);
      
      // Add metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: auth.currentUser?.uid || 'anonymous',
          uploadedAt: new Date().toISOString(),
          category,
          originalName: file.name,
          visibility: 'public'
        }
      };
  
      // Upload file
      const snapshot = await uploadBytes(storageRef, file, metadata);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading public media:', error);
      throw error;
    }
  };
  
  /**
   * Upload user profile/document image (PRIVATE)
   * Structure: users/{userId}/{type}/{filename}
   */
  export const uploadUserImage = async (
    file: File, 
    userId: string, 
    type: 'profile' | 'document' = 'profile'
  ): Promise<string> => {
    try {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Solo se permiten archivos de imagen (JPG, PNG, WEBP)');
      }
  
      const maxSize = type === 'profile' ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB for profile, 5MB for documents
      if (file.size > maxSize) {
        const sizeMB = Math.round(maxSize / (1024 * 1024));
        throw new Error(`El archivo no puede ser mayor a ${sizeMB}MB`);
      }
  
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${type}_${timestamp}.${fileExtension}`;
      
      const storageRef = ref(storage, `users/${userId}/${type}/${fileName}`);
      
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          userId,
          type,
          visibility: 'private'
        }
      };
  
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading user image:', error);
      throw error;
    }
  };
  
  /**
   * Get public media URLs (for website use)
   */
  export const getPublicMediaUrl = (path: string): string => {
    // Since public content allows read: if true, we can construct direct URLs
    // But it's better to use getDownloadURL for consistency
    const storageRef = ref(storage, `public/${path}`);
    return `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/public%2F${encodeURIComponent(path)}?alt=media`;
  };
  
  /**
   * List public media files (for admin media management)
   */
  export const listPublicMedia = async (category?: string): Promise<string[]> => {
    try {
      const folderRef = ref(storage, category ? `public/${category}` : 'public');
      const result = await listAll(folderRef);
      
      const urls = await Promise.all(
        result.items.map(item => getDownloadURL(item))
      );
      
      return urls;
    } catch (error) {
      console.error('Error listing public media:', error);
      return [];
    }
  };
  
  /**
   * Delete any file (admin only)
   */
  export const deleteFile = async (fullPath: string): Promise<void> => {
    try {
      const storageRef = ref(storage, fullPath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };
  
  /**
   * Helper to extract file path from Firebase Storage URL
   */
  export const getFilePathFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
      return pathMatch ? decodeURIComponent(pathMatch[1]) : '';
    } catch {
      return '';
    }
  };
  
  /**
   * General utility to validate file before upload
   */
  export const validateFile = (
    file: File, 
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
      maxWidth?: number;
      maxHeight?: number;
    } = {}
  ): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const {
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      } = options;
  
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        resolve({ 
          valid: false, 
          error: `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}` 
        });
        return;
      }
  
      // Check file size
      if (file.size > maxSize) {
        const sizeMB = Math.round(maxSize / (1024 * 1024));
        resolve({ 
          valid: false, 
          error: `El archivo es demasiado grande. Máximo: ${sizeMB}MB` 
        });
        return;
      }
  
      // If image dimensions need to be checked
      if (options.maxWidth || options.maxHeight) {
        const img = new Image();
        img.onload = () => {
          if (options.maxWidth && img.width > options.maxWidth) {
            resolve({ 
              valid: false, 
              error: `Ancho máximo: ${options.maxWidth}px` 
            });
            return;
          }
          if (options.maxHeight && img.height > options.maxHeight) {
            resolve({ 
              valid: false, 
              error: `Alto máximo: ${options.maxHeight}px` 
            });
            return;
          }
          resolve({ valid: true });
        };
        img.onerror = () => {
          resolve({ valid: false, error: 'Archivo de imagen inválido' });
        };
        img.src = URL.createObjectURL(file);
      } else {
        resolve({ valid: true });
      }
    });
  };