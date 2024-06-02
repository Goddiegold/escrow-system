import { User } from '@prisma/client';
import EmailEngine from './EmailEngine';

export default class Email extends EmailEngine {
  constructor(user: User, url: string) {
    super(user, url);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the SportsPadi family');
  }

  async sendVerifiedAccountMessage() {
    await this.send('account_verified', 'Email account verified successfully');
  }

  async sendPlayerAccountCreationMessage() {
    await this.send(
      'player_account_created',
      'Player account created successfully',
    );
  }

  async sendAgentAccountCreationMessage() {
    await this.send(
      'agent_account_created',
      'Agent account created successfully',
    );
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your reset password token (valid for only 10 minutes)',
    );
  }

  async sendPasswordUpdated() {
    await this.send('passwordUpdated', 'Password updated successfully');
  }

  async sendNewContactUserMessage() {
    await this.send('contact_user_created', 'Welcome to SportsPadi');
  }

  async sendNewContactAdminMessage() {
    await this.send('contact_admin_created', 'New visitor registered');
  }
}
