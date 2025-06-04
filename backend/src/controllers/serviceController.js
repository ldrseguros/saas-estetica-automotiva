import {
  findAllServices,
  addNewService,
  findServiceById,
  modifyService,
  removeService,
} from "../services/serviceService.js";

// @desc    Get all services
// @route   GET /api/admin/services
// @access  Admin
export const getAllServices = async (req, res) => {
  try {
    const services = await findAllServices();
    res.status(200).json(services);
  } catch (error) {
    console.error("Error in getAllServices controller:", error);
    // Consider more specific error handling or a generic error handler middleware
    res
      .status(500)
      .json({ message: "Error fetching services", error: error.message });
  }
};

// @desc    Get all services for public view
// @route   GET /api/services
// @access  Public
export const getPublicServices = async (req, res) => {
  try {
    const services = await findAllServices();
    res.status(200).json(services);
  } catch (error) {
    console.error("Error in getPublicServices controller:", error);
    res
      .status(500)
      .json({ message: "Error fetching services", error: error.message });
  }
};

// @desc    Create a new service
// @route   POST /api/admin/services
// @access  Admin
export const createService = async (req, res) => {
  const { title, description, price, duration, imageSrc } = req.body;

  // Basic validation remains in controller or moves to middleware
  if (!title || price === undefined) {
    return res.status(400).json({ message: "Title and price are required." });
  }

  try {
    const newService = await addNewService({
      title,
      description,
      price,
      duration,
      imageSrc,
    });
    res.status(201).json(newService);
  } catch (error) {
    console.error("Error in createService controller:", error);
    // Handle specific errors, e.g., Prisma's P2002 for unique constraint violation if not handled in service
    if (error.code === "P2002" && error.meta?.target?.includes("title")) {
      return res
        .status(409)
        .json({ message: "A service with this title already exists." });
    }
    res
      .status(500)
      .json({ message: "Error creating service", error: error.message });
  }
};

// @desc    Get a single service by ID
// @route   GET /api/admin/services/:id
// @access  Admin
export const getServiceById = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await findServiceById(id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error(`Error in getServiceById controller (ID: ${id}):`, error);
    res.status(500).json({
      message: `Error fetching service with ID ${id}`,
      error: error.message,
    });
  }
};

// @desc    Update a service by ID
// @route   PUT /api/admin/services/:id
// @access  Admin
export const updateService = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, duration, imageSrc } = req.body;

  try {
    // It's good practice to ensure the resource exists before attempting to update
    // This can be done in the service or controller
    const existingService = await findServiceById(id);
    if (!existingService) {
      return res
        .status(404)
        .json({ message: "Service not found, cannot update." });
    }

    const updatedService = await modifyService(id, {
      title,
      description,
      price,
      duration,
      imageSrc,
    });
    res.status(200).json(updatedService);
  } catch (error) {
    console.error(`Error in updateService controller (ID: ${id}):`, error);
    if (error.code === "P2002" && error.meta?.target?.includes("title")) {
      return res
        .status(409)
        .json({ message: "A service with this title already exists." });
    }
    // P2025: Record to update not found (handled by explicit check above, but good to be aware of for other Prisma errors)
    res.status(500).json({
      message: `Error updating service with ID ${id}`,
      error: error.message,
    });
  }
};

// @desc    Delete a service by ID
// @route   DELETE /api/admin/services/:id
// @access  Admin
export const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    // Ensure the resource exists before attempting to delete
    const existingService = await findServiceById(id);
    if (!existingService) {
      return res
        .status(404)
        .json({ message: "Service not found, cannot delete." });
    }

    await removeService(id);
    res
      .status(200)
      .json({ message: `Service with ID ${id} deleted successfully` });
  } catch (error) {
    console.error(`Error in deleteService controller (ID: ${id}):`, error);
    // Handle specific Prisma errors if needed, e.g., P2003 for foreign key constraint violation
    // if it's not handled/prevented in the service layer or by application logic.
    res.status(500).json({
      message: `Error deleting service with ID ${id}`,
      error: error.message,
    });
  }
};
