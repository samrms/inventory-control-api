export class MovementsService {
    constructor(movementsRepository) {
        this.movementsRepository = movementsRepository
    }

    async list(query) {
        return this.movementsRepository.findAll(query)
    }
}
