interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): User {
    this.users.push(user);
    return user;
  }

  findUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getAllUsers(): User[] {
    return [...this.users];
  }
}

describe('TypeScript Features Test', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it('should add a user correctly', () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    };

    const result = userService.addUser(user);
    expect(result).toEqual(user);
    expect(userService.getAllUsers()).toHaveLength(1);
  });

  it('should find a user by id', () => {
    const user1: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    };
    
    const user2: User = {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com'
    };

    userService.addUser(user1);
    userService.addUser(user2);

    const foundUser = userService.findUserById(2);
    expect(foundUser).toEqual(user2);
  });

  it('should return undefined for non-existent user', () => {
    const foundUser = userService.findUserById(999);
    expect(foundUser).toBeUndefined();
  });
});
