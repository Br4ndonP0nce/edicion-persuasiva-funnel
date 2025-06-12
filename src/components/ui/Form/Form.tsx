"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { addLead } from "@/lib/firebase/db";
import {
  validateEmail,
  validateName,
  validatePhone,
  generateWhatsAppLink,
  COUNTRY_VALIDATIONS,
  PhoneValidationResult,
} from "@/lib/phoneValidationUtils";

// Question types
type QuestionType =
  | "text"
  | "email"
  | "phone"
  | "select"
  | "multi-select"
  | "textarea";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  description?: string;
  options?: Option[];
}

// Define our form questions
const questions: Question[] = [
  {
    id: "name",
    text: "¿Cuál es tu nombre?",
    type: "text",
    required: true,
  },
  {
    id: "email",
    text: "¿Cuál es tu mejor correo?",
    type: "email",
    required: true,
    description: "Con este correo te meteremos a la comunidad si accedes.",
  },
  {
    id: "phone",
    text: "¿Cuál es tu número de WhatsApp?",
    type: "phone",
    required: true,
    description: "Para contactarte de forma personalizada.",
  },
  {
    id: "role",
    text: "¿Cuál opción es la que mejor te describe?",
    type: "select",
    required: true,
    options: [
      {
        id: "professional",
        text: "Soy editor/a de video y es mi principal fuente de ingresos",
      },
      {
        id: "part-time",
        text: "Soy editor/a de video pero mis ingresos provienen de otras fuente",
      },
      { id: "beginner", text: "Aun no edito video pero deseo aprender" },
    ],
  },
  {
    id: "level",
    text: "¿Qué nivel de edición consideras que tienes?",
    type: "select",
    required: true,
    options: [
      { id: "expert", text: "Muy alto" },
      { id: "advanced", text: "Alto" },
      { id: "intermediate", text: "Medio" },
      { id: "beginner", text: "Principiante" },
      { id: "none", text: "No sé nada de edición" },
    ],
  },
  {
    id: "software",
    text: "¿Con qué programa editas?",
    type: "select",
    required: true,
    options: [
      { id: "adobe", text: "La Suite de Adobe (Premiere pro o After Effects)" },
      { id: "davinci", text: "DaVinci Resolve" },
      { id: "capcut", text: "CapCut" },
      { id: "filmora", text: "Filmora" },
      { id: "other", text: "Otro" },
    ],
  },
  {
    id: "clients",
    text: "¿Cómo consigues clientes de edición cada mes?",
    type: "select",
    required: true,
    options: [
      {
        id: "outbound",
        text: "Escribo mensajes a cuentas ofreciendo mis servicios todos los días.",
      },
      {
        id: "inbound",
        text: "Creo contenido y recibo mensajes de prospectos todos los días.",
      },
      {
        id: "referrals",
        text: "Conocidos y amigos recomiendan mis servicios.",
      },
      {
        id: "struggling",
        text: "No tengo clientes, he batallado mucho con eso.",
      },
      { id: "not-editor", text: "No me dedico a la edición de video." },
    ],
  },
  {
    id: "investment",
    text: "¿Estás dispuesta/o a invertir entre $800 y $1,300 dólares en tu crecimiento exponencial como editor/a?",
    type: "select",
    required: true,
    options: [
      { id: "yes", text: "Sí, tengo acceso a ese monto y estoy dispuesta/o" },
      { id: "maybe", text: "No tengo ese monto ahora, pero puedo conseguirlo" },
      { id: "no", text: "Definitivamente no" },
    ],
  },
  {
    id: "why",
    text: "Cuéntanos por qué deberíamos darte acceso a esta formación:",
    type: "textarea",
    required: true,
    description:
      "La formación es exclusiva y queremos a personas MUY COMPROMETIDAS.",
  },
];

// Generate country codes from COUNTRY_VALIDATIONS (single source of truth)
const countryCodes = COUNTRY_VALIDATIONS.filter((c) => c.code !== "+999") // Exclude fallback
  .sort((a, b) => {
    // Prioritize Latin America and Caribbean
    const latinAmericanCodes = [
      "+52",
      "+55",
      "+54",
      "+57",
      "+56",
      "+51",
      "+58",
      "+593",
      "+591",
      "+598",
      "+595",
      "+507",
      "+503",
      "+502",
      "+504",
      "+505",
      "+53",
      "+509",
    ];

    const aIsLA = latinAmericanCodes.includes(a.code);
    const bIsLA = latinAmericanCodes.includes(b.code);

    // Handle +1 countries (NANP) - prioritize Caribbean and North America
    const isCaribbean = (country: string) =>
      [
        "Dominican Republic",
        "Puerto Rico",
        "Jamaica",
        "Trinidad and Tobago",
        "Barbados",
      ].includes(country);
    const isNorthAmerica = (country: string) =>
      ["United States", "Canada"].includes(country);

    if (a.code === "+1" && b.code === "+1") {
      if (isCaribbean(a.country) && !isCaribbean(b.country)) return -1;
      if (!isCaribbean(a.country) && isCaribbean(b.country)) return 1;
      if (isNorthAmerica(a.country) && !isNorthAmerica(b.country)) return -1;
      if (!isNorthAmerica(a.country) && isNorthAmerica(b.country)) return 1;
      return a.country.localeCompare(b.country);
    }

    // Latin America first
    if (aIsLA && !bIsLA && b.code !== "+1") return -1;
    if (!aIsLA && bIsLA && a.code !== "+1") return 1;

    // Then +1 countries (Caribbean + North America)
    if (a.code === "+1" && !bIsLA) return -1;
    if (b.code === "+1" && !aIsLA) return 1;

    // Finally alphabetical
    return a.country.localeCompare(b.country);
  })
  .map((c) => ({ code: c.code, country: c.country }));

// Main component
const TypeformQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [selectedCode, setSelectedCode] = useState("+52"); // Default to Mexico
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneValidationError, setPhoneValidationError] = useState<
    string | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Focus the input field when the question changes
  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      } else if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 300);
  }, [currentQuestion]);

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Validation function for current question
  const validateCurrentQuestion = (): string | null => {
    const currentQ = questions[currentQuestion];
    const currentValue = answers[currentQ.id];

    if (currentQ.required && (!currentValue || currentValue === "")) {
      return "Este campo es obligatorio";
    }

    if (currentValue) {
      switch (currentQ.type) {
        case "email":
          if (!validateEmail(currentValue)) {
            return "Por favor ingresa un correo electrónico válido";
          }
          break;
        case "phone":
          const phoneValidation = validatePhone(currentValue, selectedCode);
          if (!phoneValidation.isValid) {
            return phoneValidation.error || "Número de teléfono inválido";
          }
          break;
        case "text":
          if (currentQ.id === "name" && !validateName(currentValue)) {
            return "El nombre debe tener al menos 2 caracteres";
          }
          break;
      }
    }

    return null;
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: e.target.value,
    });
    setError(null);
    setPhoneValidationError(null);
  };

  // Handle option selection
  const handleOptionSelect = (optionId: string, optionText: string) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: optionId,
      [`${questions[currentQuestion].id}_text`]: optionText,
    });
    setError(null);

    // Auto-advance to next question after selection
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  // Handle phone input with enhanced validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");

    // Get current country validation
    const countryValidation = COUNTRY_VALIDATIONS.find(
      (c) => c.code === selectedCode
    );

    if (countryValidation && value.length <= countryValidation.maxLength) {
      const fullNumber = `${selectedCode} ${value}`;
      setAnswers({
        ...answers,
        [questions[currentQuestion].id]: fullNumber,
      });

      // Real-time validation feedback
      if (value.length >= countryValidation.minLength) {
        const validation = validatePhone(value, selectedCode);
        if (!validation.isValid) {
          setPhoneValidationError(validation.error || null);
        } else {
          setPhoneValidationError(null);
        }
      } else {
        setPhoneValidationError(null);
      }
    }

    setError(null);
  };

  // Navigate to next question
  const handleNext = () => {
    const validationError = validateCurrentQuestion();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  // Navigate to previous question
  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Validate all required fields
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const value = answers[question.id];

      if (question.required && (!value || value === "")) {
        setError(`Por favor responde la pregunta: ${question.text}`);
        setCurrentQuestion(i);
        setIsSubmitting(false);
        return;
      }

      // Additional validation for specific fields
      if (value) {
        switch (question.type) {
          case "email":
            if (!validateEmail(value)) {
              setError("Por favor ingresa un correo electrónico válido");
              setCurrentQuestion(i);
              setIsSubmitting(false);
              return;
            }
            break;
          case "phone":
            const phoneValidation = validatePhone(value, selectedCode);
            if (!phoneValidation.isValid) {
              setError(phoneValidation.error || "Número de teléfono inválido");
              setCurrentQuestion(i);
              setIsSubmitting(false);
              return;
            }
            break;
          case "text":
            if (question.id === "name" && !validateName(value)) {
              setError("El nombre debe tener al menos 2 caracteres");
              setCurrentQuestion(i);
              setIsSubmitting(false);
              return;
            }
            break;
        }
      }
    }

    try {
      // Format the lead data for Firebase
      const leadData = {
        name: answers.name || "",
        email: answers.email || "",
        phone: answers.phone || "",
        role: answers.role_text || answers.role || "",
        level: answers.level_text || answers.level || "",
        software: answers.software_text || answers.software || "",
        clients: answers.clients_text || answers.clients || "",
        investment: answers.investment_text || answers.investment || "",
        why: answers.why || "",
        status: "lead" as const,
      };

      // Add to Firestore
      const leadId = await addLead(leadData);
      console.log("Lead successfully added with ID:", leadId);

      setIsSubmitted(true);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(
        "Hubo un error al enviar el formulario. Por favor intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle key press to submit on Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  // Render the current question
  const renderQuestion = () => {
    const question = questions[currentQuestion];

    switch (question.type) {
      case "text":
        return (
          <div className="w-full">
            <input
              ref={inputRef}
              type="text"
              value={answers[question.id] || ""}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-b-2 border-white/30 focus:border-white py-2 px-1 text-lg outline-none text-white transition-colors"
              placeholder={
                question.id === "name"
                  ? "Tu nombre completo"
                  : "Escribe tu respuesta"
              }
            />
          </div>
        );

      case "email":
        const emailValue = answers[question.id] || "";

        // Real-time email validation feedback
        const getEmailValidationState = (email: string) => {
          if (!email) return { state: "empty", message: "" };

          const trimmed = email.trim();
          if (!trimmed.includes("@")) {
            return {
              state: "incomplete",
              message: "Formato de correo inválido",
            };
          }

          const parts = trimmed.split("@");
          if (parts.length !== 2) {
            return {
              state: "invalid",
              message: "Formato de correo inválido",
            };
          }

          const [localPart, domainPart] = parts;
          if (!localPart) {
            return {
              state: "incomplete",
              message: "",
            };
          }

          if (!domainPart) {
            return {
              state: "incomplete",
              message: "",
            };
          }

          if (!domainPart.includes(".")) {
            return {
              state: "incomplete",
              message: "",
            };
          }

          const domainParts = domainPart.split(".");
          const tld = domainParts[domainParts.length - 1];
          if (!tld || tld.length < 2) {
            return {
              state: "incomplete",
              message: "",
            };
          }

          if (/^\d+$/.test(tld)) {
            return {
              state: "invalid",
              message: "",
            };
          }

          if (validateEmail(trimmed)) {
            return { state: "valid", message: "Correo válido" };
          }

          return { state: "invalid", message: "Formato de correo inválido" };
        };

        const emailValidation = getEmailValidationState(emailValue);

        return (
          <div className="w-full">
            <input
              ref={inputRef}
              type="email"
              value={emailValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className={`w-full bg-transparent border-b-2 ${
                emailValidation.state === "valid"
                  ? "border-green-400 focus:border-green-300"
                  : emailValidation.state === "invalid"
                  ? "border-red-400 focus:border-red-300"
                  : "border-white/30 focus:border-white"
              } py-2 px-1 text-lg outline-none text-white transition-colors`}
              placeholder="ejemplo@correo.com"
            />

            {/* Real-time email validation feedback */}
            {emailValue && (
              <div className="mt-2 text-xs">
                {emailValidation.state === "valid" && (
                  <span className="text-green-400 flex items-center gap-1">
                    <span>✅</span> {emailValidation.message}
                  </span>
                )}
                {emailValidation.state === "incomplete" && (
                  <span className="text-yellow-400 flex items-center gap-1">
                    <span>⚠️</span> {emailValidation.message}
                  </span>
                )}
                {emailValidation.state === "invalid" && (
                  <span className="text-red-400 flex items-center gap-1">
                    <span>❌</span> {emailValidation.message}
                  </span>
                )}
              </div>
            )}

            {/* Format example */}
            <div className="text-xs text-white/40 mt-1">
              Ejemplo: usuario@dominio.com
            </div>
          </div>
        );

      case "phone":
        // ... rest of the phone case remains the same
        const phoneValue = answers[question.id] || "";
        // Extract just the national number (without country code)
        const nationalNumber = phoneValue.includes(selectedCode)
          ? phoneValue.replace(`${selectedCode} `, "").replace(/\D/g, "")
          : phoneValue.replace(/\D/g, "");

        // Get current country validation for display
        const currentCountryValidation = COUNTRY_VALIDATIONS.find(
          (c) => c.code === selectedCode
        );

        return (
          <div className="w-full">
            <div className="flex items-center gap-2">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center bg-purple-900/50 border border-purple-700/50 rounded px-2 py-1 text-white min-w-[80px]"
                >
                  {selectedCode}
                  <ChevronDown className="ml-1 w-4 h-4" />
                </button>

                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-1 max-h-60 overflow-y-auto bg-purple-900/90 border border-purple-700/50 rounded z-10 w-64">
                    {countryCodes.map((country, index) => (
                      <button
                        key={`${country.code}-${country.country}-${index}`}
                        type="button"
                        className="block w-full text-left px-3 py-2 hover:bg-purple-800/80 text-white"
                        onClick={() => {
                          setSelectedCode(country.code);
                          setShowCountryDropdown(false);
                          setPhoneValidationError(null);
                          // Update the stored value with new country code
                          if (nationalNumber) {
                            setAnswers({
                              ...answers,
                              [questions[currentQuestion]
                                .id]: `${country.code} ${nationalNumber}`,
                            });
                          }
                        }}
                      >
                        <span className="font-medium">{country.code}</span>{" "}
                        {country.country}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                ref={inputRef}
                type="tel"
                value={nationalNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "");

                  if (
                    currentCountryValidation &&
                    value.length <= currentCountryValidation.maxLength
                  ) {
                    const fullNumber = value ? `${selectedCode} ${value}` : "";
                    setAnswers({
                      ...answers,
                      [questions[currentQuestion].id]: fullNumber,
                    });

                    // Only validate if user has entered minimum length or more
                    if (value.length >= currentCountryValidation.minLength) {
                      const validation = validatePhone(value, selectedCode);
                      if (!validation.isValid) {
                        setPhoneValidationError(validation.error || null);
                      } else {
                        setPhoneValidationError(null);
                      }
                    } else {
                      // Clear validation error if user is still typing
                      setPhoneValidationError(null);
                    }
                  }

                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-b-2 border-white/30 focus:border-white py-2 px-1 text-lg outline-none text-white"
                placeholder={currentCountryValidation?.example || "1234567890"}
                maxLength={currentCountryValidation?.maxLength || 15}
              />
            </div>

            {/* Real-time validation feedback */}
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-white/60">
                <span className="text-orange-500 underline">
                  Asegurate de usar tu numero de whatsapp!
                </span>
                <br />
                {currentCountryValidation && (
                  <>
                    {nationalNumber.length >=
                      currentCountryValidation.minLength &&
                    nationalNumber.length <=
                      currentCountryValidation.maxLength &&
                    !phoneValidationError ? (
                      <span className="text-green-400">✅ Número válido</span>
                    ) : nationalNumber.length > 0 ? (
                      <span>
                        {nationalNumber.length}/
                        {currentCountryValidation.minLength}
                        {currentCountryValidation.minLength !==
                        currentCountryValidation.maxLength
                          ? `-${currentCountryValidation.maxLength}`
                          : ""}{" "}
                      </span>
                    ) : (
                      <span>
                        {currentCountryValidation.minLength}
                        {currentCountryValidation.minLength !==
                        currentCountryValidation.maxLength
                          ? `-${currentCountryValidation.maxLength}`
                          : ""}{" "}
                      </span>
                    )}
                  </>
                )}
              </div>

              {phoneValidationError && (
                <div className="text-xs text-red-300">
                  {phoneValidationError}
                </div>
              )}
            </div>

            {/* Country-specific format example */}
            {currentCountryValidation && (
              <div className="text-xs text-white/40 mt-1">
                Ejemplo móvil: {selectedCode} {currentCountryValidation.example}
              </div>
            )}
          </div>
        );

      case "select":
        return (
          <div className="w-full space-y-2">
            {question.options?.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id, option.text)}
                className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${
                  answers[question.id] === option.id
                    ? "bg-purple-700/70 border border-purple-500"
                    : "bg-purple-900/40 border border-purple-800/30 hover:bg-purple-800/50"
                } text-white`}
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                      answers[question.id] === option.id
                        ? "border-white bg-white/20"
                        : "border-white/50"
                    }`}
                  >
                    {answers[question.id] === option.id && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  {option.text}
                </div>
              </button>
            ))}
          </div>
        );

      case "textarea":
        return (
          <div className="w-full">
            <textarea
              ref={textareaRef}
              value={answers[question.id] || ""}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.shiftKey) return;
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleNext();
                }
              }}
              rows={5}
              className="w-full bg-transparent border-2 border-white/30 focus:border-white rounded-md py-2 px-3 text-lg outline-none text-white resize-none"
              placeholder="Escribe tu respuesta aquí..."
              minLength={10}
            />
            <p className="text-white/60 text-xs mt-1">
              Presiona Shift + Enter para hacer un salto de línea
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // If the form is submitted, show success message with WhatsApp CTA
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-950 flex justify-center items-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-purple-900/40 backdrop-blur-md rounded-xl p-8 max-w-md w-full text-center border border-purple-700/30"
        >
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            ¡Gracias por aplicar!
          </h2>
          <p className="text-white/80 mb-6">
            Hemos recibido tu solicitud. Nos pondremos en contacto contigo
            pronto.
          </p>

          {/* WhatsApp CTA Button */}
          {answers.phone && (
            <div className="mb-4">
              <a
                href={generateWhatsAppLink(answers.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-colors mb-3 w-full justify-center"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Si quieres que veamos tu entrada con más rapidez da click aquí
              </a>
              <p className="text-white/60 text-xs">
                Te llevará a WhatsApp con un mensaje pre-escrito
              </p>
            </div>
          )}

          <button
            onClick={() => (window.location.href = "/")}
            className="bg-white text-purple-900 font-medium py-2 px-6 rounded-md hover:bg-white/90 transition-colors w-full"
          >
            Volver al inicio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-950 flex justify-center items-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Background gradient shapes */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-purple-700/20 blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl"></div>

        {/* Subtle animated particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 blur-sm"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${
                Math.random() * 10 + 10
              }s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Main container */}
      <div className="w-full max-w-2xl mx-auto px-6 py-8 relative z-10">
        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-1 mb-8">
          <motion.div
            className="h-1 rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question container */}
        <div className="relative h-[500px] sm:h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-start"
            >
              {/* Question counter */}
              <div className="text-white/60 text-sm mb-2">
                {currentQuestion + 1} → {questions.length}
              </div>

              {/* Question text */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-white mb-2">
                {questions[currentQuestion].text}
                {questions[currentQuestion].required && (
                  <span className="text-purple-300">*</span>
                )}
              </h2>

              {/* Question description */}
              {questions[currentQuestion].description && (
                <p className="text-white/70 text-sm mb-6">
                  {questions[currentQuestion].description}
                </p>
              )}

              {/* Question input */}
              <div className="mt-6 w-full">{renderQuestion()}</div>

              {/* Error message */}
              {error && (
                <div className="mt-3 text-red-300 text-sm bg-red-900/20 border border-red-500/30 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="mt-auto pt-8 flex justify-between w-full">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                  className={`flex items-center gap-1 py-2 px-4 rounded-md ${
                    currentQuestion === 0
                      ? "opacity-0 pointer-events-none"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  } transition-colors`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={`flex items-center gap-1 py-2 px-4 rounded-md ${
                    isSubmitting
                      ? "bg-purple-700/50 text-white/70 cursor-not-allowed"
                      : "bg-purple-700 text-white hover:bg-purple-600"
                  } transition-colors`}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="w-4 h-4 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {currentQuestion === questions.length - 1
                          ? "Enviar"
                          : "Siguiente"}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Powered by (like Typeform) */}
        <div className="absolute bottom-2 right-2 text-white/40 text-xs">
          Powered by Edición Persuasiva
        </div>
      </div>

      {/* CSS for float animation */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(120deg);
          }
          66% {
            transform: translateY(5px) rotate(240deg);
          }
        }
      `}</style>
    </div>
  );
};

// Helper components
const ChevronDown = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const Spinner = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const WhatsAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
  </svg>
);

export default TypeformQuiz;
