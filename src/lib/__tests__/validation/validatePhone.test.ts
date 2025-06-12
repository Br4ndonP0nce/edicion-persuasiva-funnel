import {
    validatePhone,
    validateEmail,
    validateName,
    extractPhoneDigits,
    generateWhatsAppLink,
    isWhatsAppCompatible,
  } from '../../phoneValidationUtils';
  
  describe('Realistic Leads Data Quality Tests', () => {
  
    describe('Email Validation - Corrected Expectations', () => {
      test('should validate properly formatted emails from leads', () => {
        const validEmails = [
          'test@gmail.com',
          'fabriciomarti@gmail.com', 
          'lic.masaherrera@gmail.com',
          'ericdecock18@gmail.com',
          'fred.gongora@hotmail.com',
          'diego.ljfj.rodriguez@gmail.com',
          'ruizfranco755@gmail.com',
          'niklasdelf@gmai.com'  // VALID: Has TLD, just a typo in domain name
        ];
  
        validEmails.forEach(email => {
          expect(validateEmail(email)).toBe(true);
        });
      });
  
      test('should reject emails that are actually malformed', () => {
        const invalidEmails = [
          'jaj@hila',              // No TLD - actual from your data
          'user@domain',           // Missing TLD
          'email@',                // Missing domain
          '@gmail.com',            // Missing local part
          'spaces in@email.com',   // Invalid characters
          'double..dots@gmail.com',// Double dots
          '',                      // Empty
          'notanemail'             // No @ symbol
        ];
  
        invalidEmails.forEach(email => {
          expect(validateEmail(email)).toBe(false);
        });
      });
    });
  
    describe('Phone Validation - Separated by Actual Validity', () => {
      
      describe('VALID Numbers from Your Database', () => {
        test('should validate correctly formatted numbers that ARE valid', () => {
          const actuallyValidNumbers = [
            // Mexico - Properly formatted 10-digit numbers
            { number: '5522838461', code: '+52', country: 'Mexico' },
            { number: '5531552562', code: '+52', country: 'Mexico' },
            { number: '5554535201', code: '+52', country: 'Mexico' },
            
            // Colombia - All start with 3 (mobile format)
            { number: '3175304921', code: '+57', country: 'Colombia' },
            { number: '3218709485', code: '+57', country: 'Colombia' },
            { number: '3193963759', code: '+57', country: 'Colombia' },
            { number: '3156329051', code: '+57', country: 'Colombia' },
            
            // US - NANP format
            { number: '7473212945', code: '+1', country: 'United States' },
            { number: '7869660885', code: '+1', country: 'United States' },
            
            // Argentina - Now with corrected flexible pattern
            { number: '2324612091', code: '+54', country: 'Argentina' },
            { number: '3584388093', code: '+54', country: 'Argentina' },
            { number: '3876337104', code: '+54', country: 'Argentina' },
            { number: '9115870756', code: '+54', country: 'Argentina' },
            { number: '1125686116', code: '+54', country: 'Argentina' },
            { number: '1158872280', code: '+54', country: 'Argentina' },
            
            // Spain - 9 digits starting with 6 or 7
            { number: '672269400', code: '+34', country: 'Spain' },
            { number: '623002615', code: '+34', country: 'Spain' },
            { number: '672698481', code: '+34', country: 'Spain' },
            
            // Peru - 9 digits starting with 9
            { number: '937298503', code: '+51', country: 'Peru' },
            { number: '987810268', code: '+51', country: 'Peru' },
            { number: '941074090', code: '+51', country: 'Peru' },
            
            // Ecuador - 9 digits starting with 9
            { number: '996619909', code: '+593', country: 'Ecuador' },
            { number: '989926630', code: '+593', country: 'Ecuador' },
            { number: '980177221', code: '+593', country: 'Ecuador' },
            
            // Venezuela - Valid operator codes
            { number: '4121240200', code: '+58', country: 'Venezuela' },
            
            // Chile - ONLY the one that follows correct format
            { number: '991595467', code: '+56', country: 'Chile' },
            
            // Other valid ones
            { number: '74797139', code: '+503', country: 'El Salvador' },
            { number: '77859953', code: '+591', country: 'Bolivia' },
            { number: '7824495845', code: '+44', country: 'United Kingdom' },
          ];
  
          actuallyValidNumbers.forEach(({ number, code, country }) => {
            const result = validatePhone(number, code);
            if (!result.isValid) {
              console.log(`UNEXPECTED FAILURE: ${country} number ${number} should be valid but failed: ${result.error}`);
            }
            expect(result.isValid).toBe(true);
            expect(result.country).toBe(country);
          });
        });
      });
  
      describe('INVALID Numbers from Your Database (Data Quality Issues)', () => {
        test('should correctly reject malformed numbers', () => {
          const actuallyInvalidNumbers = [
            // Mexico - Wrong length or format (these SHOULD fail)
            { number: '554589624', code: '+52', reason: 'Only 9 digits, Mexican mobile needs 10' },
            { number: '976565888', code: '+52', reason: 'Only 9 digits' },
            { number: '292321313', code: '+52', reason: 'Only 9 digits' },
            { number: '11111111', code: '+52', reason: 'Only 8 digits, obviously fake' },
            { number: '0414535926', code: '+52', reason: 'Starts with 0, invalid for Mexican mobile' },
            { number: '0000000000', code: '+52', reason: 'Fake number' },
            
            // Argentina - The one that's actually invalid
            { number: '986109244', code: '+54', reason: 'Only 9 digits, should be 10-11' },
            
            // Chile - Wrong format (these SHOULD fail)
            { number: '77859954', code: '+56', reason: '8 digits, missing required 9 prefix' },
            { number: '9907711720', code: '+56', reason: '10 digits, should be 9' },
            { number: '9416598891', code: '+56', reason: '10 digits, should be 9' },
            { number: '6977248253', code: '+56', reason: 'Starts with 6, should start with 9' },
            
            // Venezuela - Invalid ones
            { number: '123456789', code: '+58', reason: 'Test data, wrong operator code' },
            { number: '0424923700', code: '+58', reason: 'Has leading 0, invalid format' },
            
            // Colombia - Wrong length
            { number: '315143390', code: '+57', reason: 'Only 9 digits, should be 10' },
            
            // Other invalid ones from your data
            { number: '7623947862', code: '+49', reason: 'Invalid German mobile format' },
            { number: '7235888800', code: '+506', reason: '10 digits, should be 8 for Costa Rica' },
          ];
  
          actuallyInvalidNumbers.forEach(({ number, code, reason }) => {
            const result = validatePhone(number, code);
            if (result.isValid) {
              console.log(`UNEXPECTED SUCCESS: ${number} (${code}) should be invalid but passed. Reason: ${reason}`);
            }
            expect(result.isValid).toBe(false);
          });
        });
      });
    });
  
    describe('WhatsApp Link Generation', () => {
      test('should generate correct links for valid numbers', () => {
        const validNumbers = [
          '+52 5522838461',
          '+57 3175304921', 
          '+1 7473212945',
          '+54 2324612091',
          '+34 672269400'
        ];
  
        validNumbers.forEach((number, index) => {
          const link = generateWhatsAppLink(number);
          expect(link).toContain('wa.me/');
          expect(link).toContain(encodeURIComponent('Hola, acabo de aplicar a Edición Persuasiva'));
          
          // Extract the actual clean digits for each number
          const cleanDigits = extractPhoneDigits(number);
          expect(link).toContain(cleanDigits);
          
          console.log(`WhatsApp link for ${number}: ${link}`);
        });
      });
    });
  
    describe('Data Quality Reality Check', () => {
      test('should correctly identify data quality by country', () => {
        const countryQualityAnalysis = [
          {
            country: 'Mexico (+52)',
            validSamples: ['5522838461', '5531552562'],
            invalidSamples: ['554589624', '976565888'], // 9 digits instead of 10
            note: 'Many Mexican numbers missing a digit'
          },
          {
            country: 'Argentina (+54)', 
            validSamples: ['2324612091', '3584388093', '1125686116'],
            invalidSamples: ['986109244'], // Only 9 digits
            note: 'Most Argentina numbers are now valid with flexible pattern'
          },
          {
            country: 'Chile (+56)',
            validSamples: ['991595467'], // 9 digits starting with 9
            invalidSamples: ['77859954', '9907711720'], // Wrong length/format
            note: 'Only 1/8 Chilean numbers follow correct format'
          },
          {
            country: 'Colombia (+57)',
            validSamples: ['3175304921', '3218709485'],
            invalidSamples: ['315143390'], // 9 digits instead of 10  
            note: 'Most Colombian numbers are properly formatted'
          },
          {
            country: 'Venezuela (+58)',
            validSamples: ['4121240200'], // Correct operator code
            invalidSamples: ['123456789', '0424923700'], // Test data and leading 0
            note: 'Mixed quality, some have leading zeros'
          }
        ];
  
        countryQualityAnalysis.forEach(({ country, validSamples, invalidSamples, note }) => {
          console.log(`\n📊 ${country}:`);
          console.log(`   Note: ${note}`);
          
          // Test valid samples
          validSamples.forEach(number => {
            const code = country.match(/\(([^)]+)\)/)?.[1] || '';
            const result = validatePhone(number, code);
            expect(result.isValid).toBe(true);
          });
          
          // Test invalid samples  
          invalidSamples.forEach(number => {
            const code = country.match(/\(([^)]+)\)/)?.[1] || '';
            const result = validatePhone(number, code);
            expect(result.isValid).toBe(false);
          });
        });
      });
    });
  
    describe('Email Edge Cases', () => {
      test('should handle email domain typos correctly', () => {
        const emailTests = [
          { email: 'user@gmail.com', valid: true, note: 'Correct' },
          { email: 'user@gmai.com', valid: true, note: 'Typo but has valid TLD' },
          { email: 'user@gmial.com', valid: true, note: 'Typo but has valid TLD' },
          { email: 'jaj@hila', valid: false, note: 'Missing TLD - actual issue from your data' },
        ];
  
        emailTests.forEach(({ email, valid, note }) => {
          const result = validateEmail(email);
          console.log(`📧 ${email}: ${result ? '✅' : '❌'} (${note})`);
          expect(result).toBe(valid);
        });
      });
    });
  });