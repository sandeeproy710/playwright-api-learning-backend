import { Task } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';
import { paginationMeta } from '../validators/common.schemas.js';

function buildTaskQuery(query, owner) {
  const filter = { owner };

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } }
    ];
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.priority) {
    filter.priority = query.priority;
  }

  return filter;
}

export async function listTasks(request, response) {
  const { page, limit } = request.validated.query;
  const filter = buildTaskQuery(request.validated.query, request.user._id);

  const [items, total] = await Promise.all([
    Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter)
  ]);

  return response.json({
    data: items.map((task) => task.toPublicJSON()),
    meta: paginationMeta({ page, limit, total })
  });
}

export async function createTask(request, response) {
  const task = await Task.create({
    ...request.validated.body,
    owner: request.user._id
  });

  return response.status(201).json({ data: task.toPublicJSON() });
}

export async function getTask(request, response) {
  const task = await Task.findOne({ _id: request.validated.params.id, owner: request.user._id });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  return response.json({ data: task.toPublicJSON() });
}

export async function replaceTask(request, response) {
  const task = await Task.findOneAndReplace(
    { _id: request.validated.params.id, owner: request.user._id },
    { ...request.validated.body, owner: request.user._id },
    { new: true, runValidators: true }
  );

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  return response.json({ data: task.toPublicJSON() });
}

export async function updateTask(request, response) {
  const task = await Task.findOneAndUpdate(
    { _id: request.validated.params.id, owner: request.user._id },
    request.validated.body,
    { new: true, runValidators: true }
  );

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  return response.json({ data: task.toPublicJSON() });
}

export async function deleteTask(request, response) {
  const task = await Task.findOneAndDelete({ _id: request.validated.params.id, owner: request.user._id });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  return response.status(204).send();
}
