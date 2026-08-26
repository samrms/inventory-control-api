const MAX_LIMIT = 100

export function parsePagination(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1)
    const limit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(query.limit, 10) || 20)
    )
    const offset = (page - 1) * limit

    return { page, limit, offset }
}

export function paginateResponse(data, total, page, limit) {
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
}
