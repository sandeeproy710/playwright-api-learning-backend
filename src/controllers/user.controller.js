import { User } from '../models/User.js';
import { paginationMeta } from '../validators/common.schemas.js';

export async function listUsers(request, response) {
  const { page, limit, search } = request.validated.query;
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    : {};

  const [items, total] = await Promise.all([
    User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(query)
  ]);

  return response.json({
    data: items.map((user) => user.toPublicJSON()),
    meta: paginationMeta({ page, limit, total })
  });
}
