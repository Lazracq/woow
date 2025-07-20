import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { DashboardStats, Notification } from './api';

export class SignalRService {
  private connection: HubConnection | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      this.connection = new HubConnectionBuilder()
        .withUrl('http://localhost:5776/dashboardhub')
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      // Start the connection
      await this.connection.start();
      this.isConnected = true;
      console.log('SignalR Connected');

      // Join dashboard group
      await this.connection.invoke('JoinDashboardGroup');
    } catch (error) {
      console.error('SignalR Connection Error:', error);
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.invoke('LeaveDashboardGroup');
      await this.connection.stop();
      this.isConnected = false;
      console.log('SignalR Disconnected');
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Dashboard stats updated
    this.connection.on('DashboardStatsUpdated', (stats: DashboardStats) => {
      console.log('Dashboard stats updated:', stats);
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('dashboardStatsUpdated', { detail: stats }));
    });

    // Notifications updated
    this.connection.on('NotificationsUpdated', (notifications: Notification[]) => {
      console.log('Notifications updated:', notifications);
      window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: notifications }));
    });

    // New notification
    this.connection.on('NewNotification', (notification: Notification) => {
      console.log('New notification:', notification);
      window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
    });

    // Connection events
    this.connection.onreconnecting(() => {
      console.log('SignalR Reconnecting...');
      this.isConnected = false;
    });

    this.connection.onreconnected(() => {
      console.log('SignalR Reconnected');
      this.isConnected = true;
      // Rejoin dashboard group
      this.connection?.invoke('JoinDashboardGroup');
    });

    this.connection.onclose(() => {
      console.log('SignalR Connection Closed');
      this.isConnected = false;
    });
  }

  getConnectionState(): boolean {
    return this.isConnected;
  }

  // Method to manually trigger dashboard refresh
  async refreshDashboard(): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('RefreshDashboard');
    }
  }
}

export const signalRService = new SignalRService(); 