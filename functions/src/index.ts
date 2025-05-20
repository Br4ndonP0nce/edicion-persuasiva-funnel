import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import * as v2 from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import fetch from 'node-fetch'; // You'll need to install this: npm install node-fetch

// Initialize Firebase
admin.initializeApp();

// HTTP function for testing
export const testFunction = v2.onRequest({
  region: 'us-central1',
  cors: true,
}, (req, res) => {
  console.log('HTTP function triggered!');
  
  res.status(200).send({
    status: 'success',
    message: 'Function is working!'
  });
});

// HTTP function to create a test lead
export const onNewLeadTest = v2.onRequest({
  region: 'us-central1',
  cors: true,
}, async (req, res) => {
  console.log('Manual lead test triggered');
  
  try {
    // Create a test lead document
    const db = admin.firestore();
    const testLead = {
      name: "Test Lead",
      email: "test@example.com",
      phone: "+1234567890",
      role: "Tester",
      level: "Advanced",
      software: "Premiere Pro",
      clients: "Testing",
      investment: "Sí, tengo acceso",
      why: "Testing the system",
      status: "lead",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Add to Firestore
    const docRef = await db.collection('leads').add(testLead);
    
    res.status(200).send({
      status: 'success',
      message: 'Test lead created',
      leadId: docRef.id
    });
  } catch (error) {
    console.error('Error creating test lead:', error);
    res.status(500).send({
      status: 'error',
      message: 'Failed to create test lead',
      error: (error as Error).message
    });
  }
});

// Define Lead type
interface Lead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  level?: string;
  software?: string;
  clients?: string;
  investment?: string;
  why?: string;
  status?: string;
  createdAt?: any;
}

// Updated Firestore trigger with webhook
export const onNewLead = onDocumentCreated({
  document: 'leads/{leadId}',
  region: 'us-central1',
  memory: '256MiB',
  maxInstances: 10,
  timeoutSeconds: 60,
  secrets: ["GMAIL_EMAIL", "GMAIL_PASSWORD", "ADMIN_EMAIL", "N8N_WEBHOOK_URL"]
}, async (event) => {
  try {
    console.log('onNewLead function triggered!');
    
    // Get the lead data
    const snapshot = event.data;
    if (!snapshot) {
      console.error('No data associated with the event');
      return null;
    }
    
    const leadData = snapshot.data() as Lead;
    const leadId = event.params.leadId;
    
    // Add the ID to the lead data
    leadData.id = leadId;
    
    console.log(`New lead created: ${leadId}`);
    
    // PART 1: Send email notification
    try {
      // Get email config
      const gmailEmail = process.env.GMAIL_EMAIL;
      const gmailPassword = process.env.GMAIL_PASSWORD;
      const adminEmail = process.env.ADMIN_EMAIL || gmailEmail;
      
      if (gmailEmail && gmailPassword) {
        // Set up email transport
        const mailTransport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailEmail,
            pass: gmailPassword,
          },
        });
        
        // Create email content
        const mailOptions = {
          from: `Edición Persuasiva <${gmailEmail}>`,
          to: adminEmail,
          subject: `Nuevo Lead: ${leadData.name}`,
          text: `
            Nuevo lead recibido:
            
            Nombre: ${leadData.name}
            Email: ${leadData.email}
            Teléfono: ${leadData.phone}
            ${leadData.role ? `Rol: ${leadData.role}` : ''}
            ${leadData.level ? `Nivel: ${leadData.level}` : ''}
            ${leadData.software ? `Software: ${leadData.software}` : ''}
            ${leadData.clients ? `Clientes: ${leadData.clients}` : ''}
            ${leadData.investment ? `Inversión: ${leadData.investment}` : ''}
            ${leadData.why ? `Motivación: ${leadData.why}` : ''}
          `,
        };
        
        // Send email
        await mailTransport.sendMail(mailOptions);
        console.log(`Email notification sent for lead: ${leadId}`);
      } else {
        console.error('Email configuration missing');
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Continue execution even if email fails
    }
    
    // PART 2: Trigger n8n webhook
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL;
      
      if (webhookUrl) {
        console.log(`Triggering n8n webhook for lead: ${leadId}`);
        
        // Send lead data to n8n webhook
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leadId,
            ...leadData
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Webhook request failed with status ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Webhook response:', responseData);
      } else {
        console.error('Webhook URL not configured');
      }
    } catch (webhookError) {
      console.error('Error triggering webhook:', webhookError);
    }
    
    return null;
  } catch (error) {
    console.error('Error in onNewLead function:', error);
    return null;
  }
});