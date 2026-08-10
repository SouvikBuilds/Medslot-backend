import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Doctor Appointment API", version: "1.0.0" },
    servers: [{ url: "/api/v1" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    paths: {
      // ── Users ──────────────────────────────────────────────
      "/users/register": {
        post: {
          tags: ["Users"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "User registered" } },
        },
      },
      "/users/login": {
        post: {
          tags: ["Users"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Login successful" } },
        },
      },
      "/users/logout": {
        post: {
          tags: ["Users"],
          summary: "Logout user",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Logged out" } },
        },
      },
      "/users/refresh-token": {
        post: {
          tags: ["Users"],
          summary: "Refresh access token",
          responses: { 200: { description: "Token refreshed" } },
        },
      },
      "/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get current user",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "User data" } },
        },
      },
      "/users/update-profile": {
        patch: {
          tags: ["Users"],
          summary: "Update user profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    phone: { type: "string" },
                    address: { type: "string" },
                    dob: { type: "string" },
                    gender: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Profile updated" } },
        },
      },
      "/users/magic-link": {
        post: {
          tags: ["Users"],
          summary: "Request magic login link",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: { email: { type: "string" } },
                },
              },
            },
          },
          responses: { 200: { description: "Magic link sent" } },
        },
      },
      "/users/magic-login": {
        post: {
          tags: ["Users"],
          summary: "Verify magic link token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["token"],
                  properties: { token: { type: "string" } },
                },
              },
            },
          },
          responses: { 200: { description: "Login successful" } },
        },
      },

      // ── Doctors ────────────────────────────────────────────
      "/doctors": {
        get: {
          tags: ["Doctors"],
          summary: "Get all doctors",
          responses: { 200: { description: "List of doctors" } },
        },
      },
      "/doctors/login": {
        post: {
          tags: ["Doctors"],
          summary: "Doctor login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Login successful" } },
        },
      },
      "/doctors/refresh-token": {
        post: {
          tags: ["Doctors"],
          summary: "Refresh doctor access token",
          responses: { 200: { description: "Token refreshed" } },
        },
      },
      "/doctors/me": {
        get: {
          tags: ["Doctors"],
          summary: "Get current doctor",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Doctor data" } },
        },
      },
      "/doctors/logout": {
        post: {
          tags: ["Doctors"],
          summary: "Doctor logout",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Logged out" } },
        },
      },
      "/doctors/change-password": {
        patch: {
          tags: ["Doctors"],
          summary: "Change doctor password",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["oldPassword", "newPassword"],
                  properties: {
                    oldPassword: { type: "string" },
                    newPassword: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Password changed" } },
        },
      },
      "/doctors/update-profile": {
        patch: {
          tags: ["Doctors"],
          summary: "Update doctor profile",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Profile updated" } },
        },
      },
      "/doctors/update-profile-image": {
        patch: {
          tags: ["Doctors"],
          summary: "Update doctor profile image",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: { image: { type: "string", format: "binary" } },
                },
              },
            },
          },
          responses: { 200: { description: "Image updated" } },
        },
      },
      "/doctors/update-availability": {
        patch: {
          tags: ["Doctors"],
          summary: "Toggle doctor availability",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Availability updated" } },
        },
      },
      "/doctors/{id}": {
        get: {
          tags: ["Doctors"],
          summary: "Get doctor by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Doctor data" } },
        },
      },

      // ── Appointments ───────────────────────────────────────
      "/appointments/booked-slots": {
        get: {
          tags: ["Appointments"],
          summary: "Get booked slots (public)",
          parameters: [
            { name: "doctorId", in: "query", schema: { type: "string" } },
            { name: "date", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "Booked slots" } },
        },
      },
      "/appointments/book": {
        post: {
          tags: ["Appointments"],
          summary: "Book an appointment",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["doctorId", "date", "time"],
                  properties: {
                    doctorId: { type: "string" },
                    date: { type: "string" },
                    time: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Appointment booked" } },
        },
      },
      "/appointments/my-appointments": {
        get: {
          tags: ["Appointments"],
          summary: "Get patient's appointments",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Appointments list" } },
        },
      },
      "/appointments/cancel/{id}": {
        patch: {
          tags: ["Appointments"],
          summary: "Patient cancel appointment",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Appointment cancelled" } },
        },
      },
      "/appointments/razorpay/create-order": {
        post: {
          tags: ["Appointments"],
          summary: "Create Razorpay order",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["appointmentId"],
                  properties: { appointmentId: { type: "string" } },
                },
              },
            },
          },
          responses: { 200: { description: "Order created" } },
        },
      },
      "/appointments/razorpay/verify": {
        post: {
          tags: ["Appointments"],
          summary: "Verify Razorpay payment",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"],
                  properties: {
                    razorpay_order_id: { type: "string" },
                    razorpay_payment_id: { type: "string" },
                    razorpay_signature: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Payment verified" } },
        },
      },
      "/appointments/doctor-appointments": {
        get: {
          tags: ["Appointments"],
          summary: "Get doctor's appointments",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Appointments list" } },
        },
      },
      "/appointments/doctor-dashboard": {
        get: {
          tags: ["Appointments"],
          summary: "Doctor dashboard stats",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Dashboard data" } },
        },
      },
      "/appointments/complete/{id}": {
        patch: {
          tags: ["Appointments"],
          summary: "Mark appointment complete",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Marked complete" } },
        },
      },
      "/appointments/doctor-cancel/{id}": {
        patch: {
          tags: ["Appointments"],
          summary: "Doctor cancel appointment",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Appointment cancelled" } },
        },
      },
      "/appointments/all": {
        get: {
          tags: ["Appointments"],
          summary: "Admin — get all appointments",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "All appointments" } },
        },
      },
      "/appointments/admin-cancel/{id}": {
        patch: {
          tags: ["Appointments"],
          summary: "Admin cancel appointment",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Appointment cancelled" } },
        },
      },

      // ── Admin ──────────────────────────────────────────────
      "/admin/login": {
        post: {
          tags: ["Admin"],
          summary: "Admin login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Login successful" } },
        },
      },
      "/admin/dashboard": {
        get: {
          tags: ["Admin"],
          summary: "Admin dashboard stats",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Dashboard data" } },
        },
      },
      "/admin/users": {
        get: {
          tags: ["Admin"],
          summary: "Get all users",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Users list" } },
        },
      },
      "/admin/users/{id}": {
        delete: {
          tags: ["Admin"],
          summary: "Delete user",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "User deleted" } },
        },
      },
      "/admin/doctors": {
        get: {
          tags: ["Admin"],
          summary: "Get all doctors",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Doctors list" } },
        },
        post: {
          tags: ["Admin"],
          summary: "Register a doctor",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password", "speciality", "degree", "experience", "about", "fees"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                    speciality: { type: "string" },
                    degree: { type: "string" },
                    experience: { type: "string" },
                    about: { type: "string" },
                    fees: { type: "number" },
                    image: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Doctor registered" } },
        },
      },
      "/admin/doctors/{id}": {
        delete: {
          tags: ["Admin"],
          summary: "Delete doctor",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Doctor deleted" } },
        },
      },
      "/admin/messages": {
        get: {
          tags: ["Admin"],
          summary: "Get all messages",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Messages list" } },
        },
      },
      "/admin/messages/{id}": {
        get: {
          tags: ["Admin"],
          summary: "Get message by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Message data" } },
        },
        delete: {
          tags: ["Admin"],
          summary: "Delete message",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Message deleted" } },
        },
      },

      // ── Messages ───────────────────────────────────────────
      "/messages/send-message": {
        post: {
          tags: ["Messages"],
          summary: "Send a contact message",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "message"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Message sent" } },
        },
      },
      "/messages/my-messages": {
        get: {
          tags: ["Messages"],
          summary: "Get my messages",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Messages list" } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

const darkThemeCSS = `
  body { background: #1a1a2e !important; }
  .swagger-ui { background: #1a1a2e; color: #e0e0e0; }
  .swagger-ui .topbar { background: #16213e; border-bottom: 1px solid #0f3460; }
  .swagger-ui .info .title, .swagger-ui .info p, .swagger-ui .info li,
  .swagger-ui .info a { color: #e0e0e0 !important; }
  .swagger-ui .scheme-container { background: #16213e; box-shadow: none; }
  .swagger-ui .opblock-tag { color: #a8d8ea; border-bottom: 1px solid #0f3460; }
  .swagger-ui .opblock { background: #16213e; border: 1px solid #0f3460; border-radius: 6px; }
  .swagger-ui .opblock .opblock-summary-description { color: #b0b0b0; }
  .swagger-ui .opblock.opblock-get .opblock-summary { background: #0d2137; border-color: #2196f3; }
  .swagger-ui .opblock.opblock-post .opblock-summary { background: #0d2b1a; border-color: #4caf50; }
  .swagger-ui .opblock.opblock-patch .opblock-summary { background: #2b1f0d; border-color: #ff9800; }
  .swagger-ui .opblock.opblock-delete .opblock-summary { background: #2b0d0d; border-color: #f44336; }
  .swagger-ui .opblock-body, .swagger-ui .opblock-section { background: #1a1a2e; }
  .swagger-ui .tab li, .swagger-ui label, .swagger-ui .parameter__name,
  .swagger-ui .parameter__type, .swagger-ui table thead tr th,
  .swagger-ui .response-col_status { color: #c0c0c0 !important; }
  .swagger-ui input[type=text], .swagger-ui textarea, .swagger-ui select {
    background: #0f3460; color: #e0e0e0; border: 1px solid #1a5276; border-radius: 4px;
  }
  .swagger-ui .btn { background: #0f3460; color: #e0e0e0; border-color: #1a5276; }
  .swagger-ui .btn.execute { background: #1565c0; border-color: #1565c0; }
  .swagger-ui .btn.authorize { background: #1b5e20; border-color: #1b5e20; color: #fff; }
  .swagger-ui .model-box, .swagger-ui section.models { background: #16213e; border-color: #0f3460; }
  .swagger-ui .model { color: #c0c0c0; }
  .swagger-ui .responses-inner h4, .swagger-ui .responses-inner h5 { color: #a8d8ea; }
  .swagger-ui .response-col_description { color: #b0b0b0; }
  .swagger-ui .highlight-code { background: #0d1b2a !important; }
  .swagger-ui .microlight { background: #0d1b2a !important; color: #a8d8ea !important; }
`;

export function setupSwagger(app) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: darkThemeCSS,
      customSiteTitle: "Doctor Appointment API Docs",
    })
  );
}
