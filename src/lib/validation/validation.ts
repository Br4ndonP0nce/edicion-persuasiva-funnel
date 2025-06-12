// validations.ts

export interface PhoneValidation {
    length: number[];
    regex: RegExp;
    example: string;
  }
  
  export const COUNTRY_VALIDATIONS: Record<string, PhoneValidation> = {
    "+52": { // México
      length: [10],
      regex: /^[1-9]{2}[0-9]{8}$/, // evita 0X y 1X iniciales
      example: "5512345678",
    },
    "+54": { // Argentina
      length: [10, 11],
      regex: /^1[0-9]{9,10}$/, // móvil con y sin 9
      example: "1123456789",
    },
    "+55": { // Brasil
      length: [11],
      regex: /^1[1-9][9][0-9]{8}$/, // Ej: 11987654321
      example: "11987654321",
    },
    "+56": { // Chile
      length: [9],
      regex: /^[89][0-9]{8}$/, // celulares inician con 9
      example: "987654321",
    },
    "+57": { // Colombia
      length: [10],
      regex: /^3[0-9]{9}$/, // todos los móviles inician en 3
      example: "3001234567",
    },
    "+506": { // Costa Rica
      length: [8],
      regex: /^[6-8][0-9]{7}$/, // móviles CR inician en 6, 7, u 8
      example: "87654321",
    },
    "+51": { // Perú
      length: [9],
      regex: /^9[0-9]{8}$/, // móviles inician en 9
      example: "987654321",
    },
    "+58": { // Venezuela
      length: [10],
      regex: /^(412|414|424|416|426)[0-9]{7}$/,
      example: "4123456789",
    },
    "+593": { // Ecuador
      length: [9],
      regex: /^9[0-9]{8}$/, // celulares inician con 9
      example: "987654321",
    },
    "+591": { // Bolivia
      length: [8],
      regex: /^[67][0-9]{7}$/,
      example: "71234567",
    },
    "+598": { // Uruguay
      length: [8],
      regex: /^9[0-9]{7}$/, // móviles inician en 9
      example: "91234567",
    },
    "+595": { // Paraguay
      length: [9],
      regex: /^9[0-9]{8}$/,
      example: "987654321",
    },
  };
  
  export function validatePhone(value: string, areaCode: string) {
    const onlyNumbers = value.replace(/[^0-9]/g, "");
    const countryValidation = COUNTRY_VALIDATIONS[areaCode];
  
    if (!countryValidation) {
      return {
        isValid: false,
        message: "Código de país no soportado",
      };
    }
  
    const isCorrectLength = countryValidation.length.includes(onlyNumbers.length);
    const isValid = isCorrectLength && countryValidation.regex.test(onlyNumbers);
  
    return {
      isValid,
      message: isValid
        ? ""
        : `Ejemplo válido: ${areaCode} ${countryValidation.example}`,
    };
  }
  