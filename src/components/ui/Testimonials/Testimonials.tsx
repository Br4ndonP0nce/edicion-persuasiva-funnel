"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MotionDiv,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";
import { motion } from "framer-motion";
import Image from "next/image";

const TestimonialsSection = () => {
  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const glowVariant = {
    initial: { boxShadow: "0 0 10px 0px rgba(138, 43, 226, 0.4)" },
    hover: { boxShadow: "0 0 25px 5px rgba(138, 43, 226, 0.6)" },
  };

  return (
    <section className="py-16 bg-black relative">
      {/* Purple glow background effects */}
      <div className="absolute top-1/4 left-[10%] w-80 h-80 rounded-full bg-purple-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-[10%] w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />

      {/* Quote at the top */}
      <div className="container mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <p className="text-xl md:text-2xl lg:text-3xl text-white font-medium italic">
            "La mejor forma de editar bien y vivir bien de la edición es con un
            mentor que ya ha logrado lo que quieres lograr"
          </p>
        </motion.div>
      </div>

      <motion.div
        className="container mx-auto px-4 space-y-24"
        variants={containerVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* First Testimonial - Santiago */}
        <motion.div variants={itemVariant} className="relative">
          <motion.div
            initial="initial"
            whileHover="hover"
            variants={glowVariant}
            className="bg-[#13111b]/90 backdrop-blur-sm rounded-lg border border-purple-900/50 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Left side - Discord conversation */}
              <div className="w-full md:w-1/2 p-6">
                <div className="bg-gray-900/70 rounded-lg p-4">
                  {/* Discord message 1 */}
                  <div className="flex gap-3 mb-4">
                    <div className="flex-shrink-0">
                      <Image
                        src="/images/santiago-avatar.jpg"
                        width={40}
                        height={40}
                        alt="Santiago Montilla"
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          Santiago Montilla
                        </span>
                        <span className="text-gray-400 text-xs">
                          hoy a las 17:23
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mt-1">
                        Diego, muy temprano respondió jaja, le puse un valor de
                        1275 dólares, me acepto la propuesta, por lo que pide
                        creo que esta más que bien ese precio
                      </p>
                      <p className="text-gray-300 text-sm mt-1">
                        todo lo realizamos a través de llamada
                      </p>
                    </div>
                  </div>

                  {/* Discord message 2 */}
                  <div className="flex gap-3 mb-4">
                    <div className="flex-shrink-0">
                      <Image
                        src="/images/diego-avatar.jpg"
                        width={40}
                        height={40}
                        alt="diego.hh"
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          diego.hh
                        </span>
                        <span className="text-gray-400 text-xs">
                          hoy a las 17:32
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mt-1">
                        Bro!!! Excelente!! Qué buena win 🔥
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1">
                          <span className="text-red-500">❤️</span>
                          <span className="text-gray-400 text-xs">1</span>
                        </span>
                        <span className="text-gray-300">😊</span>
                      </div>
                    </div>
                  </div>

                  {/* Discord message 3 */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Image
                        src="/images/santiago-avatar.jpg"
                        width={40}
                        height={40}
                        alt="Santiago Montilla"
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          Santiago Montilla
                        </span>
                        <span className="text-gray-400 text-xs">
                          hoy a las 17:34
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mt-1">
                        muchísimas gracias por hacer todo esto posible invertir
                        en tu curso la verdad que fue, una de la mejores si es
                        que la mejor inversión que e realizado en mi corta vida,
                        sos un grande 🔥
                      </p>
                      <p className="text-gray-300 text-sm mt-1">
                        no se como agradecertelo simplemente muchas gracias
                        Diego 🔥
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Results summary */}
              <div className="w-full md:w-1/2 p-6 bg-[#1a1526] flex flex-col justify-center">
                <h3 className="purple-text-glow !text-purple-300 drop-shadow-2xl text-2xl md:text-3xl font-bold mb-4">
                  $1,275 dólares mensuales de UN SOLO CLIENTE
                </h3>
                <p className="text-gray-300 mb-4">
                  para Santiago, un mes después de haber ingresado a la
                  academia, más un cliente extra de $110 por video
                </p>
                <p className="text-gray-300 mb-8">
                  Todo, desde la bolsa de trabajo de la Academia
                </p>

                {/* Bolsa de trabajo tag */}
                <div className="inline-flex items-center bg-gray-800/80 px-3 py-2 rounded-md self-start">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-300">#</span>
                      <span className="text-white">bolsa-de-trabajo</span>
                      <span className="text-purple-400">💼</span>
                    </div>
                    <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">
                      99
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Second Testimonial - Andrew */}
        <motion.div variants={itemVariant} className="relative">
          <motion.div
            initial="initial"
            whileHover="hover"
            variants={glowVariant}
            className="bg-[#13111b]/90 backdrop-blur-sm rounded-lg border border-purple-900/50 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Left side - Summary */}
              <div className="w-full md:w-1/2 p-6 bg-[#1a1526] flex flex-col justify-center order-2 md:order-1">
                <h3 className="purple-text-glow !text-purple-300 drop-shadow-2xl text-2xl md:text-3xl font-bold mb-2">
                  $1,000 dólares mensuales con UN SOLO CLIENTE
                </h3>
                <div className="flex items-center mb-2">
                  <span className="text-2xl text-white">+</span>
                </div>
                <h3 className="purple-text-glow !text-purple-300 drop-shadow-2xl text-2xl md:text-3xl font-bold mb-4">
                  $350 dólares por video con otro cliente
                </h3>
                <p className="text-gray-300">
                  para Andrew quien ingresó a finales de enero y en febrero
                  adquirió el cliente desde la bolsa de trabajo de la academia.
                </p>
              </div>

              {/* Right side - Discord conversation */}
              <div className="w-full md:w-1/2 p-6 order-1 md:order-2">
                <div className="space-y-4">
                  <div className="bg-gray-900/70 rounded-lg p-4">
                    {/* First discord message */}
                    <div className="flex gap-3 mb-4">
                      <div className="flex-shrink-0">
                        <Image
                          src="/images/andrew-avatar.jpg"
                          width={40}
                          height={40}
                          alt="Andrew_C"
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            Andrew_C
                          </span>
                          <span className="text-gray-400 text-xs">
                            hoy a las 17:29
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mt-1">
                          Hola a todos!
                        </p>
                        <p className="text-gray-300 text-sm mt-2">
                          Oigan :D, pues quiero darles una noticia que me tiene
                          muy contento.
                        </p>
                        <p className="text-gray-300 text-sm mt-2">
                          Apliqué para uno de los trabajos que nos compartió
                          Diego, un vlog de coches de un compa venezolano que
                          vive en EEUU. Después de platicar un rato y de la
                          buena labor de Diego, he sido elegido para ser el
                          editor de su canal. Estoy muy emocionado, llevaba un
                          rato queriendo hacer videos explicativos.
                        </p>
                        <p className="text-gray-300 text-sm mt-2">
                          A darle! les contaré más adelante cómo va todo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/70 rounded-lg p-4">
                    {/* Second message */}
                    <div className="flex gap-3 mb-4">
                      <div className="flex-shrink-0">
                        <Image
                          src="/images/andrew-avatar.jpg"
                          width={40}
                          height={40}
                          alt="Andrew_C"
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            Andrew_C
                          </span>
                          <span className="text-gray-400 text-xs">
                            23/4/25, 20:04
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mt-1">¡Qué tal!</p>
                        <p className="text-gray-300 text-sm mt-2">
                          Quisiera compartir una #victoria que me ayudó mucho a
                          recobrar ánimos y sentirme validado como editor.
                        </p>
                        <p className="text-gray-300 text-sm mt-2">
                          Cuando comencé a finales de diciembre, andaba algo
                          desanimado por los ingresos. Después de un rato
                          apliqué y entré en contacto con un cliente de la bolsa
                          de trabajo. Me comentó de lo que se trataba y tras ser
                          finalmente aceptado, la iguala quedó en $1,000 USD
                          mensuales. El mes pasado hice la primera tanda de
                          reels y a la creadora le gustaron mucho para su
                          perfil!
                        </p>
                        <p className="text-gray-300 text-sm mt-2">
                          Estoy muy contento porque además logramos una relación
                          laboral super cordial. Actualmente ya estoy trabajando
                          en la segunda tanda y todo marcha muy bien.
                        </p>
                      </div>
                    </div>

                    {/* Reply to second message */}
                    <div className="flex gap-3 mt-4 ml-6">
                      <div className="flex-shrink-0">
                        <Image
                          src="/images/diego-avatar.jpg"
                          width={32}
                          height={32}
                          alt="diego.hh"
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            diego.hh
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mt-1">
                          ¿Siempre se logró por $350 el video?
                        </p>
                      </div>
                    </div>

                    {/* Reply to the reply */}
                    <div className="flex gap-3 mt-4 ml-12">
                      <div className="flex-shrink-0">
                        <Image
                          src="/images/andrew-avatar.jpg"
                          width={32}
                          height={32}
                          alt="Andrew_C"
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            Andrew_C
                          </span>
                          <span className="text-gray-400 text-xs">
                            7/2/25, 19:19
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mt-1">
                          Si! 350. Creo que pude comunicar bien el valor
                          objetivamente. Tendrá toda mi atención
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Third Testimonial - Alex */}
        <motion.div variants={itemVariant} className="relative">
          <motion.div
            initial="initial"
            whileHover="hover"
            variants={glowVariant}
            className="bg-[#13111b]/90 backdrop-blur-sm rounded-lg border border-purple-900/50 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Left side - Discord conversation */}
              <div className="w-full md:w-1/2 p-6">
                <div className="space-y-4">
                  <div className="bg-gray-900/70 rounded-lg p-4">
                    {/* First discord message */}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <Image
                          src="/images/alex-avatar.jpg"
                          width={40}
                          height={40}
                          alt="Alex"
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">Alex</span>
                          <span className="text-gray-400 text-xs">
                            10/2/25, 15:00
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mt-1">
                          Hola les vengo a compartir un logro siendo unos de mis
                          objetivos para con mi Marca Personal que fue alcanzar
                          mi primer Cliente para servicios de Edición, esperando
                          sea el inicio de un camino por recorrer, gracias
                          @Diego por toda la colaboración 🔥
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/70 rounded-lg p-4">
                    {/* Second message */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <p className="text-gray-300 text-sm">
                          Te imaginas en diciembre con el curso con otro enfoque
                          comencé esto sin usar Premiere o After, y ya para acá
                          pues ya trabajando con clientes jaja que radical todo
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional section heading */}
                  <div className="mt-6 mb-3">
                    <h3 className="text-purple-300 text-xl font-semibold">
                      Ahora también trabaja para Paola Herrera
                    </h3>
                  </div>

                  <div className="bg-gray-900/70 rounded-lg p-4">
                    <p className="text-gray-300 text-sm mb-4">
                      Paola me contactó en busca de editores y ahora Alex le
                      edita algo de contenido ($660 usd al mes), esto por medio
                      de la bolsa de trabajo de la Academia.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side - Results summary */}
              <div className="w-full md:w-1/2 p-6 bg-[#1a1526] flex flex-col justify-between">
                <div>
                  <h3 className="purple-text-glow !text-purple-300 drop-shadow-2xl text-2xl md:text-3xl font-bold mb-4">
                    De no saber editar a cerrar su PRIMER CLIENTE
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Alex ingresó sin haber tocado Premiere Pro o After Effects.
                    Hoy ya recibe pagos y le han aumentado la paga por su nivel
                    superior de edición
                  </p>

                  <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                    <p className="text-gray-300 text-sm">
                      Fíjate que ya me delegaron más clientes en este caso el
                      esposo de Fernanda la clienta los mismos videos de Fer y
                      los de Gert cliente de su agencia, quiero organizarme en
                      eso!
                      <span className="text-gray-500 italic">(editado)</span>
                    </p>
                  </div>
                </div>

                {/* WhatsApp message preview */}
                <div className="mt-auto">
                  <div className="bg-black/40 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 bg-green-900/20 p-2 border-b border-gray-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      <div className="flex items-center gap-2">
                        <Image
                          src="/images/paola-avatar.jpg"
                          width={32}
                          height={32}
                          alt="Paola Herrera"
                          className="rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-white">
                              Paola Herrera
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-blue-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="text-xs text-gray-400">
                            @paolaherrerabeauty
                          </div>
                        </div>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="text-xs text-gray-400 text-center mb-2">
                        19 MAR, 12:35
                      </div>

                      <div className="flex gap-2 mb-4">
                        <Image
                          src="/images/paola-avatar.jpg"
                          width={28}
                          height={28}
                          alt="Paola"
                          className="rounded-full self-end"
                        />
                        <div className="bg-gray-800 rounded-lg rounded-bl-none p-3 max-w-[80%]">
                          <p className="text-white text-sm">
                            Buen día Diego, te escribo de parte del equipo de
                            Paola Herrera
                          </p>
                          <p className="text-white text-sm mt-1">
                            Realizas ediciones para otros creadores?
                          </p>
                          <div className="text-xs text-gray-400 text-right mt-1">
                            19 MAR, 18:21
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mb-3">
                        <div className="bg-purple-600 rounded-lg rounded-br-none p-3 max-w-[80%]">
                          <p className="text-white text-sm">
                            Hola! Mucho gusto
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <div className="bg-purple-600 rounded-lg rounded-tr-none p-3 max-w-[80%]">
                          <p className="text-white text-sm">
                            Yo actualmente no, pero tengo una academia de
                            edición que es donde estoy centrado 100%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Apply button at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-16 text-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-purple-700 hover:bg-purple-600 text-white font-semibold text-lg py-3 px-10 rounded-md purple-glow"
        >
          Deseo Aplicar
        </motion.button>
      </motion.div>
    </section>
  );
};

export default TestimonialsSection;
