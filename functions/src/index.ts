import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { Lead } from './types';

admin.initializeApp();

// Configure email transport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Helper function to format date in a nice format
 */
const formatDate = (timestamp: any): string => {
  if (!timestamp) return 'N/A';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Format a lead's data into a nice HTML email
 */
const formatLeadEmail = (lead: Lead): string => {
  // Determine investment level for styling
  const getInvestmentLevel = (investment: string) => {
    if (investment.includes('Sí, tengo acceso')) return '🔥 Alto - Listo para invertir';
    if (investment.includes('puedo conseguirlo')) return '⚠️ Medio - Necesita preparación';
    return '❄️ Bajo - No dispuesto a invertir';
  };

  // Mapping for status colors
  const statusColor = {
    'lead': '#6366f1', // Indigo
    'onboarding': '#f59e0b', // Amber
    'sale': '#10b981', // Emerald
    'rejected': '#ef4444' // Red
  };

  // Lead status display text
  const leadStatus = {
    'lead': '🆕 Nuevo Lead',
    'onboarding': '🔄 En Onboarding',
    'sale': '💰 Venta Concretada',
    'rejected': '❌ Rechazado'
  };

  // Generate HTML email
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nuevo Lead - Edición Persuasiva</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 650px;
        margin: 0 auto;
        padding: 20px;
      }
      .lead-card {
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
      }
      .lead-header {
        padding: 15px 20px;
        background: ${statusColor[lead.status || 'lead']};
        color: white;
        font-size: 18px;
        font-weight: bold;
      }
      .lead-body {
        padding: 20px;
        background: #f9fafb;
      }
      .lead-field {
        margin-bottom: 15px;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 15px;
      }
      .lead-field:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }
      .field-label {
        font-weight: bold;
        color: #6b7280;
        font-size: 14px;
        text-transform: uppercase;
        margin-bottom: 5px;
      }
      .field-value {
        font-size: 16px;
      }
      .highlight {
        background: #fef3c7;
        padding: 2px 5px;
        border-radius: 4px;
      }
      .lead-footer {
        padding: 15px 20px;
        background: #f3f4f6;
        font-size: 14px;
        color: #6b7280;
        text-align: center;
      }
      .btn {
        display: inline-block;
        background: ${statusColor[lead.status || 'lead']};
        color: white;
        padding: 10px 20px;
        margin: 10px 0;
        border-radius: 5px;
        text-decoration: none;
        font-weight: bold;
      }
      .investment-indicator {
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: bold;
        display: inline-block;
        margin-bottom: 5px;
      }
      .contact-buttons {
        display: flex;
        gap: 10px;
        margin-top: 15px;
      }
      .contact-btn {
        padding: 8px 15px;
        border-radius: 5px;
        text-decoration: none;
        font-weight: bold;
        font-size: 14px;
        text-align: center;
        flex: 1;
      }
      .email-btn {
        background: #3b82f6;
        color: white;
      }
      .whatsapp-btn {
        background: #10b981;
        color: white;
      }
    </style>
  </head>
  <body>
    <div class="lead-card">
      <div class="lead-header">
        ${leadStatus[lead.status || 'lead']} - Edición Persuasiva
      </div>
      <div class="lead-body">
        <div class="lead-field">
          <div class="field-label">Nombre</div>
          <div class="field-value">${lead.name}</div>
        </div>
        <div class="lead-field">
          <div class="field-label">Contacto</div>
          <div class="field-value">
            <strong>Email:</strong> ${lead.email}<br>
            <strong>WhatsApp:</strong> ${lead.phone}
            
            <div class="contact-buttons">
              <a href="mailto:${lead.email}" class="contact-btn email-btn">Enviar Email</a>
              <a href="https://wa.me/${lead.phone.replace(/\s+/g, '').replace('+', '')}" class="contact-btn whatsapp-btn">WhatsApp</a>
            </div>
          </div>
        </div>
        <div class="lead-field">
          <div class="field-label">Perfil</div>
          <div class="field-value">
            <strong>Rol:</strong> ${lead.role}<br>
            <strong>Nivel:</strong> ${lead.level}<br>
            <strong>Software:</strong> ${lead.software}<br>
            <strong>Clientes:</strong> ${lead.clients}
          </div>
        </div>
        <div class="lead-field">
          <div class="field-label">Potencial de inversión</div>
          <div class="field-value">
            <div class="investment-indicator" style="background: ${
              lead.investment.includes('Sí') ? '#dcfce7' : 
              lead.investment.includes('puedo') ? '#fef9c3' : '#fee2e2'
            }; color: ${
              lead.investment.includes('Sí') ? '#166534' : 
              lead.investment.includes('puedo') ? '#854d0e' : '#991b1b'
            };">
              ${getInvestmentLevel(lead.investment)}
            </div><br>
            ${lead.investment}
          </div>
        </div>
        <div class="lead-field">
          <div class="field-label">Motivación</div>
          <div class="field-value">
            <em>"${lead.why}"</em>
          </div>
        </div>
      </div>
      <div class="lead-footer">
        <a href="${process.env.APP_URL || 'https://edicionpersuasiva.com'}/admin/leads/${lead.id}" class="btn">
          Ver en dashboard
        </a>
        <p>Este lead fue generado el ${formatDate(lead.createdAt)}</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Format a confirmation email to send to the user
 */
const formatUserConfirmationEmail = (lead: Lead): string => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>¡Gracias por tu aplicación! - Edición Persuasiva</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 650px;
        margin: 0 auto;
        padding: 20px;
      }
      .email-container {
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .email-header {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
        padding: 30px 20px;
        text-align: center;
      }
      .email-header h1 {
        color: white;
        margin: 0;
        font-size: 24px;
        letter-spacing: 1px;
      }
      .email-body {
        background: #fff;
        padding: 30px 20px;
      }
      .email-footer {
        background: #f9fafb;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #6b7280;
      }
      .highlight {
        font-weight: bold;
        color: #8b5cf6;
      }
      .btn {
        display: inline-block;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        text-decoration: none;
        padding: 12px 25px;
        border-radius: 5px;
        font-weight: bold;
        margin-top: 20px;
        box-shadow: 0 4px 6px rgba(139, 92, 246, 0.2);
      }
      .social-links {
        margin-top: 20px;
      }
      .social-link {
        display: inline-block;
        margin: 0 10px;
        color: #6b7280;
        text-decoration: none;
      }
      .divider {
        height: 1px;
        background-color: #e5e7eb;
        margin: 25px 0;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <h1>¡GRACIAS POR TU APLICACIÓN!</h1>
      </div>
      <div class="email-body">
        <p>Hola <span class="highlight">${lead.name}</span>,</p>
        
        <p>¡Acabamos de recibir tu aplicación para <strong>Edición Persuasiva</strong>! Queremos agradecerte por tu interés en mejorar tus habilidades de edición y comenzar a generar más ingresos.</p>
        
        <p>Nuestro equipo revisará tu aplicación en las próximas 24-48 horas y te contactaremos personalmente para discutir los próximos pasos.</p>
        
        <p>Mientras tanto, si tienes alguna pregunta o necesitas asistencia, no dudes en responder a este correo electrónico o contactarnos por WhatsApp.</p>
        
        <div style="text-align: center;">
          <a href="https://wa.me/+5215555555555" class="btn">Envíanos un mensaje</a>
        </div>
        
        <div class="divider"></div>
        
        <p><strong>¿Qué sigue?</strong></p>
        <ol>
          <li>Revisaremos tu aplicación</li>
          <li>Te contactaremos personalmente</li>
          <li>Determinaremos si eres un buen candidato para el programa</li>
          <li>Te guiaremos a través del proceso de inscripción</li>
        </ol>
        
        <p>Mientras esperas, te recomendamos echar un vistazo a algunos de nuestros <a href="https://www.youtube.com/@edicionpersuasiva" style="color: #8b5cf6; text-decoration: underline;">videos gratuitos en YouTube</a> para comenzar a mejorar tus habilidades de edición.</p>
      </div>
      <div class="email-footer">
        <p>© 2025 Edición Persuasiva. Todos los derechos reservados.</p>
        <div class="social-links">
          <a href="https://instagram.com/edicionpersuasiva" class="social-link">Instagram</a>
          <a href="https://youtube.com/@edicionpersuasiva" class="social-link">YouTube</a>
          <a href="https://tiktok.com/@edicionpersuasiva" class="social-link">TikTok</a>
        </div>
        <p style="margin-top: 20px; font-size: 12px;">
          Si no solicitaste esta información, por favor ignora este correo.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Cloud Function triggered when a new lead is created in Firestore (V2 version)
 */
export const newLeadNotification = onDocumentCreated(
  'leads/{leadId}',
  async (event) => {
    // Get the document data
    const snapshot = event.data;
    if (!snapshot) {
      logger.error('No data associated with the event');
      return;
    }

    const leadData = snapshot.data() as Lead;
    const leadId = event.params.leadId;
    
    // Add the ID to the lead data
    leadData.id = leadId;
    
    try {
      // 1. Send notification email to admin/CRM
      const adminMailOptions = {
        from: `Edición Persuasiva <${process.env.EMAIL_FROM || 'notificaciones@edicionpersuasiva.com'}>`,
        to: process.env.EMAIL_ADMIN || 'admin@edicionpersuasiva.com',
        subject: `✨ Nuevo Lead: ${leadData.name} - ${leadData.investment.includes('Sí') ? '¡CALIENTE!' : leadData.investment.includes('puedo') ? 'Interesado' : 'Frío'}`,
        html: formatLeadEmail(leadData),
      };

      // 2. Send confirmation email to the user
      const userMailOptions = {
        from: `Edición Persuasiva <${process.env.EMAIL_FROM || 'contacto@edicionpersuasiva.com'}>`,
        to: leadData.email,
        subject: `¡Gracias por tu aplicación! - Edición Persuasiva`,
        html: formatUserConfirmationEmail(leadData),
      };

      // Send both emails
      await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(userMailOptions)
      ]);
      
      logger.info(`Email notifications sent for lead: ${leadId}`);
      return;
    } catch (error) {
      logger.error('Error sending email notifications:', error);
      return;
    }
  }
);

/**
 * Cloud Function to update lead status (can be triggered from n8n)
 */
export const updateLeadStatus = onRequest(
  { cors: true },
  async (req, res) => {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(204).send('');
      return;
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).send({ error: 'Method not allowed' });
      return;
    }

    // Basic API key authentication
    const apiKey = req.headers.authorization?.split('Bearer ')[1];
    if (apiKey !== process.env.API_KEY) {
      res.status(403).send({ error: 'Unauthorized' });
      return;
    }

    try {
      const { leadId, status, notes } = req.body;
      
      if (!leadId || !status) {
        res.status(400).send({ error: 'Missing required fields (leadId, status)' });
        return;
      }
      
      // Validate status
      const validStatuses = ['lead', 'onboarding', 'sale', 'rejected'];
      if (!validStatuses.includes(status)) {
        res.status(400).send({ error: 'Invalid status value' });
        return;
      }
      
      // Update the lead in Firestore
      const leadRef = admin.firestore().collection('leads').doc(leadId);
      
      // Check if lead exists
      const leadDoc = await leadRef.get();
      if (!leadDoc.exists) {
        res.status(404).send({ error: 'Lead not found' });
        return;
      }
      
      // Update fields
      await leadRef.update({
        status,
        notes: notes || '',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Return success
      res.status(200).send({ 
        success: true, 
        message: 'Lead status updated successfully',
        leadId,
        status
      });
    } catch (error) {
      logger.error('Error updating lead status:', error);
      res.status(500).send({ error: 'Server error', details: error });
    }
  }
);

/**
 * Cloud Function to integrate with n8n agent
 * This can be called by your n8n workflow to update lead data with agent analysis
 */
export const updateLeadFromAgent = onRequest(
  { cors: true },
  async (req, res) => {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(204).send('');
      return;
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).send({ error: 'Method not allowed' });
      return;
    }

    // Basic API key authentication
    const apiKey = req.headers.authorization?.split('Bearer ')[1];
    if (apiKey !== process.env.API_KEY) {
      res.status(403).send({ error: 'Unauthorized' });
      return;
    }

    try {
      const { leadId, agentData } = req.body;
      
      if (!leadId || !agentData) {
        res.status(400).send({ error: 'Missing required fields (leadId, agentData)' });
        return;
      }
      
      // Update the lead in Firestore
      const leadRef = admin.firestore().collection('leads').doc(leadId);
      
      // Check if lead exists
      const leadDoc = await leadRef.get();
      if (!leadDoc.exists) {
        res.status(404).send({ error: 'Lead not found' });
        return;
      }
      
      // Update with agent data
      await leadRef.update({
        agentData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Return success
      res.status(200).send({ 
        success: true, 
        message: 'Lead updated with agent data',
        leadId
      });
    } catch (error) {
      logger.error('Error updating lead with agent data:', error);
      res.status(500).send({ error: 'Server error', details: error });
    }
  }
);