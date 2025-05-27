"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { addLead } from "@/lib/firebase/db";

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

// Email validation regex - RFC 5322 compliant
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Phone validation - exactly 10 digits
const PHONE_REGEX = /^\d{8,10}$/;

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

// Country codes for phone selection
const countryCodes = [
  { code: "+93", country: "Afghanistan" },
  { code: "+355", country: "Albania" },
  { code: "+213", country: "Algeria" },
  { code: "+376", country: "Andorra" },
  { code: "+244", country: "Angola" },
  { code: "+1", country: "United States" },
  { code: "+52", country: "Mexico" },
  { code: "+34", country: "Spain" },
  { code: "+44", country: "United Kingdom" },
  { code: "+91", country: "India" },
  { code: "+86", country: "China" },
  { code: "+55", country: "Brazil" },
  { code: "+54", country: "Argentina" },
  { code: "+57", country: "Colombia" },
  { code: "+56", country: "Chile" },
  { code: "+51", country: "Peru" },
  { code: "+58", country: "Venezuela" },
  { code: "+502", country: "Guatemala" },
  { code: "+503", country: "El Salvador" },
  { code: "+504", country: "Honduras" },
  { code: "+505", country: "Nicaragua" },
  { code: "+506", country: "Costa Rica" },
  { code: "+507", country: "Panama" },
  { code: "+53", country: "Cuba" },
  { code: "+1", country: "Dominican Republic" },
  { code: "+593", country: "Ecuador" },
];

// Validation functions
const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

const validatePhone = (phoneNumber: string): boolean => {
  // Remove country code and spaces to get just the numbers
  const numbersOnly = phoneNumber.replace(/^\+\d+\s/, "").replace(/\D/g, "");
  return PHONE_REGEX.test(numbersOnly);
};

const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

// Main component
const TypeformQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [selectedCode, setSelectedCode] = useState("+52"); // Default to Mexico
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          if (!validatePhone(currentValue)) {
            return "El número de teléfono debe tener exactamente entre 8 y 10 dígitos";
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
  };

  // Handle option selection
  const handleOptionSelect = (optionId: string, optionText: string) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: optionId,
      [`${questions[currentQuestion].id}_text`]: optionText, // Store the display text too
    });
    setError(null);

    // Auto-advance to next question after selection
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  // Handle phone input with validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 10 digits
    const value = e.target.value.replace(/\D/g, "");

    // Limit to 10 digits
    if (value.length <= 10) {
      setAnswers({
        ...answers,
        [questions[currentQuestion].id]: `${selectedCode} ${value}`,
      });
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
            if (!validatePhone(value)) {
              setError(
                "El número de teléfono debe tener exactamente entre 8 y 10 dígitos"
              );
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
        status: "lead" as const, // Initial status
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
      case "email":
        return (
          <div className="w-full">
            <input
              ref={inputRef}
              type={question.type === "email" ? "email" : "text"}
              value={answers[question.id] || ""}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-b-2 border-white/30 focus:border-white py-2 px-1 text-lg outline-none text-white"
              placeholder={
                question.type === "email"
                  ? "ejemplo@correo.com"
                  : "Escribe tu respuesta aquí..."
              }
            />
          </div>
        );

      case "phone":
        const phoneValue = answers[question.id] || "";
        const numbersOnly = phoneValue
          .replace(`${selectedCode} `, "")
          .replace(/\D/g, "");

        return (
          <div className="w-full">
            <div className="flex items-center gap-2">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center bg-purple-900/50 border border-purple-700/50 rounded px-2 py-1 text-white"
                >
                  {selectedCode}
                  <ChevronDown className="ml-1 w-4 h-4" />
                </button>

                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-1 max-h-60 overflow-y-auto bg-purple-900/90 border border-purple-700/50 rounded z-10 w-64">
                    {countryCodes.map((country) => (
                      <button
                        key={`${country.code}-${country.country}`}
                        type="button"
                        className="block w-full text-left px-3 py-2 hover:bg-purple-800/80 text-white"
                        onClick={() => {
                          setSelectedCode(country.code);
                          setShowCountryDropdown(false);
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
                value={numbersOnly}
                onChange={handlePhoneChange}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-b-2 border-white/30 focus:border-white py-2 px-1 text-lg outline-none text-white"
                placeholder="1234567890"
                maxLength={10}
              />
            </div>
            <div className="text-xs text-white/60 mt-1">
              {numbersOnly.length >= 8 && numbersOnly.length <= 10 ? (
                <span className="text-green-500">✅</span>
              ) : null}
            </div>
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

  // If the form is submitted, show success message
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
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-white text-purple-900 font-medium py-2 px-6 rounded-md hover:bg-white/90 transition-colors"
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

export default TypeformQuiz;
