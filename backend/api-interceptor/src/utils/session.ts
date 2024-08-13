import { Session, Sessions } from "../types/define"
import { config } from "../config";

const createSessions = (): Sessions  => {
  const storage = new Map<string, Session>();

  const startAutoClear = () => {
    const timer = setInterval(() => {
      autoClear(config.session.lifetime);
    }, config.session.intervalForClear);
    return () => {
      clearInterval(timer);
    }
  }

  const getSession = (id: string) => {
    const session = storage.get(id);
    if (session) {
      session.timestamp = Date.now();
    }
    return session;
  }

  const setSession = (id: string, session: Session) => {
    const prev = getSession(id);
    storage.set(id, {
      ...prev,
      ...session,
      timestamp: Date.now(),
    });
  }

  const autoClear = (lifetime: number) => {
    const now = Date.now();
    const outdates: string[] = [];
    storage.forEach((session, id) => {
      const { timestamp } = session;
      if (now - timestamp! > lifetime) {
        outdates.push(id);
      }
    });
    outdates.forEach(id => {
      storage.delete(id);
    });
  }

  return {
    getSession,
    setSession,
    startAutoClear,
  }
}

export {
  createSessions
}