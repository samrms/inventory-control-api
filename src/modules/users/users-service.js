import { AppError } from '../../shared/errors/app-error.js'

export class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository
    }

    async list(query) {
        return this.usersRepository.findAll(query)
    }

    async getById(id) {
        const user = await this.usersRepository.findById(id)
        if (!user) {
            throw new AppError('User not found', 404)
        }
        return user
    }

    async update(id, data) {
        const user = await this.usersRepository.findById(id)
        if (!user) {
            throw new AppError('User not found', 404)
        }
        return this.usersRepository.update(id, data)
    }

    async delete(id) {
        const user = await this.usersRepository.findById(id)
        if (!user) {
            throw new AppError('User not found', 404)
        }
        return this.usersRepository.delete(id)
    }
}
