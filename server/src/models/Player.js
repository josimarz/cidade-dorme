export class Player {
  constructor(id, name, socketId) {
    this.id = id;
    this.name = name;
    this.socketId = socketId;
    this.role = null;
    this.isReady = false;
    this.isNarrator = false;
    this.joinedAt = new Date();
  }

  setRole(role) {
    this.role = role;
  }

  setReady(ready) {
    this.isReady = ready;
  }

  setNarrator(isNarrator) {
    this.isNarrator = isNarrator;
  }

  toPublic() {
    return {
      id: this.id,
      name: this.name,
      isReady: this.isReady,
      isNarrator: this.isNarrator,
      hasRole: this.role !== null
    };
  }

  toPrivate() {
    return {
      ...this.toPublic(),
      role: this.role
    };
  }
} 