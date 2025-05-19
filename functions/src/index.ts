import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import * as v2 from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

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
  } catch (error: Error | unknown) {
    console.error('Error creating test lead:', error);
    res.status(500).send({
      status: 'error',
      message: 'Failed to create test lead',
      error: error instanceof Error ? error.message : 'Unknown error'
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

// Updated Firestore trigger with corrected options
export const onNewLead = onDocumentCreated({
  document: 'leads/{leadId}',
  region: 'us-central1',
  memory: '256MiB', // Ensure adequate memory
  maxInstances: 10,
  timeoutSeconds: 60, // More time for email operations
  secrets: ["GMAIL_EMAIL", "GMAIL_PASSWORD", "ADMIN_EMAIL"] // Define required secrets
  // Removed environmentVariables property
}, async (event) => {
  try {
    console.log('onNewLead function triggered!');
    console.log('Document path:', event.document);
    console.log('Parameters:', event.params);
    
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
    
    console.log(`New lead created: ${leadId}`, leadData);
    
    // Get email config from environment variables/secrets
    const gmailEmail = process.env.GMAIL_EMAIL;
    const gmailPassword = process.env.GMAIL_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || gmailEmail;
    
    console.log('Email config exists:', !!gmailEmail && !!gmailPassword);
    
    // If no email config, log and exit
    if (!gmailEmail || !gmailPassword) {
      console.error('Email configuration missing');
      return null;
    }
    
    // Log for debugging
    console.log('Setting up email transport with:', { 
      service: 'gmail',
      email: gmailEmail.substring(0, 3) + '...' 
    });
    
    // Set up email transport
    const mailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailEmail,
        pass: gmailPassword,
      },
    });
    
    // Create simple email content
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
    
    console.log('Sending email to:', adminEmail);
    
    // Send email
    await mailTransport.sendMail(mailOptions);
    console.log(`Email notification sent for lead: ${leadId}`);
    
    return null;
  } catch (error) {
    console.error('Error in onNewLead function:', error);
    return null;
  }
});