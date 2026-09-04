import { dataStore } from '../services/dataStore.js';

export const supportController = {
  // POST /api/v1/support/tickets
  async createTicket(req, res) {
    try {
      const user = req.user;
      const { subject, category, message, collegeName, departmentName } = req.body;

      if (!subject || !subject.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a subject for your inquiry.',
        });
      }

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide details or a message for your inquiry.',
        });
      }

      const ticket = await dataStore.createSupportTicket({
        userId: user?.id,
        userName: user?.full_name || user?.email?.split('@')[0] || 'Student',
        userEmail: user?.email || '',
        collegeName: collegeName || user?.colleges?.name || user?.college?.name || 'Campus',
        departmentName: departmentName || user?.departments?.name || user?.department?.name || 'General',
        subject: subject.trim(),
        category: category || 'General',
        initialMessage: message.trim(),
      });

      return res.status(201).json({
        success: true,
        message: 'Support ticket created successfully. Admin has been notified.',
        data: ticket,
      });
    } catch (error) {
      console.error('Create support ticket error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to submit support query.',
      });
    }
  },

  // GET /api/v1/support/my-tickets
  async getMyTickets(req, res) {
    try {
      const userId = req.user.id;
      const tickets = await dataStore.getUserTickets(userId);

      return res.status(200).json({
        success: true,
        data: tickets || [],
      });
    } catch (error) {
      console.error('Get my support tickets error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve your support tickets.',
      });
    }
  },

  // GET /api/v1/support/tickets/:id
  async getTicketDetails(req, res) {
    try {
      const { id } = req.params;
      const ticket = await dataStore.getTicketById(id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Support ticket not found.',
        });
      }

      const isAdmin =
        (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') &&
        (req.user.email || '').toLowerCase().trim() === 'vshivachaitanya7@gmail.com';

      // Only the ticket owner or the verified admin can read the ticket
      if (String(ticket.user_id) !== String(req.user.id) && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this ticket.',
        });
      }

      return res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      console.error('Get ticket details error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve ticket details.',
      });
    }
  },

  // POST /api/v1/support/tickets/:id/messages
  async addMessage(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const user = req.user;

      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Message content cannot be empty.',
        });
      }

      const ticket = await dataStore.getTicketById(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Support ticket not found.',
        });
      }

      const isAdmin =
        (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') &&
        (user.email || '').toLowerCase().trim() === 'vshivachaitanya7@gmail.com';

      if (String(ticket.user_id) !== String(user.id) && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to post in this ticket.',
        });
      }

      const senderRole = isAdmin ? 'ADMIN' : 'STUDENT';
      const senderName = isAdmin ? 'Shiva Chaitanya (Admin)' : (user.full_name || 'Student');

      const newMessage = await dataStore.addTicketMessage(id, {
        senderId: user.id,
        senderRole,
        senderName,
        content: content.trim(),
      });

      return res.status(201).json({
        success: true,
        message: 'Message sent.',
        data: newMessage,
      });
    } catch (error) {
      console.error('Add message error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to send message.',
      });
    }
  },

  // GET /api/v1/support/admin/tickets (Admin only)
  async getAdminTickets(req, res) {
    try {
      const { status, search } = req.query;
      const tickets = await dataStore.getAllTickets({ status, search });

      return res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets || [],
      });
    } catch (error) {
      console.error('Get admin tickets error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve support queries.',
      });
    }
  },

  // PATCH /api/v1/support/admin/tickets/:id/status (Admin only)
  async updateTicketStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(String(status).toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be OPEN, IN_PROGRESS, or RESOLVED.',
        });
      }

      const updated = await dataStore.updateTicketStatus(id, status.toUpperCase());

      return res.status(200).json({
        success: true,
        message: `Ticket marked as ${status.toUpperCase()}.`,
        data: updated,
      });
    } catch (error) {
      console.error('Update ticket status error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update ticket status.',
      });
    }
  },
};
