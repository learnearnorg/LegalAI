import { Presence, EditorAction } from './types';

type SyncCallback = (action: EditorAction) => void;
type PresenceCallback = (presence: Presence[]) => void;

class LegalSyncService {
  private socket: WebSocket | null = null;
  private onActionReceived: SyncCallback | null = null;
  private onPresenceUpdated: PresenceCallback | null = null;
  private mockPresence: Presence[] = [];

  constructor() {
    // In a real environment, this would be a real WS URL
    // For this demo, we simulate the socket lifecycle
  }

  connect(documentId: string, currentUser: { id: string, name: string, avatar: string }) {
    console.log(`[Sync] Connecting to document session: ${documentId}`);
    
    // Simulate initial presence
    this.mockPresence = [
      { userId: '2', name: 'Marcus Thorne', cursorPos: 42, color: '#f59e0b', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
      { userId: '1', name: 'Sarah Chen', cursorPos: 120, color: '#10b981', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' }
    ];

    // Trigger initial presence callback
    setTimeout(() => this.onPresenceUpdated?.(this.mockPresence), 500);

    // Simulate occasional remote edits for "Real-time" effect
    setInterval(() => {
      if (Math.random() > 0.8 && this.onActionReceived) {
        const randomAction: EditorAction = {
          userId: '2',
          type: 'insert',
          text: ' ',
          position: Math.floor(Math.random() * 100),
          timestamp: Date.now()
        };
        this.onActionReceived(randomAction);
      }
    }, 5000);
  }

  onAction(callback: SyncCallback) {
    this.onActionReceived = callback;
  }

  onPresence(callback: PresenceCallback) {
    this.onPresenceUpdated = callback;
  }

  sendAction(action: EditorAction) {
    // Real implementation: this.socket.send(JSON.stringify(action))
    console.debug('[Sync] Outgoing Action:', action);
  }

  updateCursor(userId: string, pos: number) {
    // Mock updating remote view of our cursor
    this.mockPresence = this.mockPresence.map(p => p.userId === userId ? { ...p, cursorPos: pos } : p);
    this.onPresenceUpdated?.(this.mockPresence);
  }

  disconnect() {
    console.log('[Sync] Disconnecting document session');
    this.socket?.close();
  }
}

export const syncService = new LegalSyncService();