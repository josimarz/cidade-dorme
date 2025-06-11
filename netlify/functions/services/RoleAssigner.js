export class RoleAssigner {
  static ROLES = {
    NARRADOR: 'Narrador',
    ASSASSINO: 'Assassino', 
    CURANDEIRO: 'Curandeiro',
    DETETIVE: 'Detetive',
    FOFOQUEIRO: 'Fofoqueiro',
    VITIMA: 'Vítima'
  };

  static UNIQUE_ROLES = [
    RoleAssigner.ROLES.ASSASSINO,
    RoleAssigner.ROLES.CURANDEIRO,
    RoleAssigner.ROLES.DETETIVE,
    RoleAssigner.ROLES.FOFOQUEIRO
  ];

  /**
   * Distribui papéis para uma lista de jogadores
   * O narrador já deve estar definido antes da chamada
   * @param {Player[]} players - Lista de jogadores (incluindo narrador)
   * @returns {Map<string, string>} Mapa playerId -> role
   */
  static assignRoles(players) {
    if (players.length < 6) {
      throw new Error('Mínimo de 6 jogadores necessários');
    }

    if (players.length > 15) {
      throw new Error('Máximo de 15 jogadores permitidos');
    }

    // Encontrar o narrador
    const narrator = players.find(p => p.isNarrator);
    if (!narrator) {
      throw new Error('Narrador não encontrado');
    }

    // Jogadores que não são narradores
    const nonNarratorPlayers = players.filter(p => !p.isNarrator);
    
    // Embaralhar a lista de jogadores
    const shuffledPlayers = this.shuffle([...nonNarratorPlayers]);
    
    const assignments = new Map();
    
    // Atribuir narrador
    assignments.set(narrator.id, RoleAssigner.ROLES.NARRADOR);
    
    // Atribuir papéis únicos (primeiros 4 jogadores embaralhados)
    RoleAssigner.UNIQUE_ROLES.forEach((role, index) => {
      assignments.set(shuffledPlayers[index].id, role);
    });
    
    // Restante são vítimas
    for (let i = 4; i < shuffledPlayers.length; i++) {
      assignments.set(shuffledPlayers[i].id, RoleAssigner.ROLES.VITIMA);
    }
    
    return assignments;
  }

  /**
   * Embaralha um array usando Fisher-Yates shuffle
   * @param {Array} array 
   * @returns {Array}
   */
  static shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Valida se a distribuição de papéis está correta
   * @param {Map<string, string>} assignments 
   * @returns {boolean}
   */
  static validateAssignments(assignments) {
    const roleCount = new Map();
    
    for (const role of assignments.values()) {
      roleCount.set(role, (roleCount.get(role) || 0) + 1);
    }
    
    // Verificar se há exatamente 1 narrador
    if (roleCount.get(RoleAssigner.ROLES.NARRADOR) !== 1) {
      return false;
    }
    
    // Verificar se há exatamente 1 de cada papel único
    for (const uniqueRole of RoleAssigner.UNIQUE_ROLES) {
      if (roleCount.get(uniqueRole) !== 1) {
        return false;
      }
    }
    
    return true;
  }
} 