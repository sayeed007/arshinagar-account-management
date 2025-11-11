import { Request, Response } from 'express';
import SystemSetting from '../models/SystemSetting';

/**
 * Get all settings
 */
export const getAllSettings = async (req: Request, res: Response) => {
  try {
    const { category, isActive } = req.query;
    const query: any = {};

    if (category) {
      query.category = category;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const settings = await SystemSetting.find(query).sort({ category: 1, key: 1 });

    res.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SETTINGS_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Get setting by key
 */
export const getSettingByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const setting = await SystemSetting.findOne({ key });

    if (!setting) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SETTING_NOT_FOUND',
          message: 'Setting not found',
        },
      });
    }

    res.json({
      success: true,
      data: setting,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SETTING_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Create or update setting
 */
export const upsertSetting = async (req: Request, res: Response) => {
  try {
    const { key, value, type, category, description, isEditable, isActive } = req.body;

    if (!key || value === undefined || !type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Key, value, and type are required',
        },
      });
    }

    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      { value, type, category, description, isEditable, isActive },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      data: setting,
      message: 'Setting saved successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPSERT_SETTING_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Update setting value
 */
export const updateSettingValue = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_VALUE',
          message: 'Value is required',
        },
      });
    }

    const setting = await SystemSetting.findOne({ key });

    if (!setting) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SETTING_NOT_FOUND',
          message: 'Setting not found',
        },
      });
    }

    if (!setting.isEditable) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SETTING_NOT_EDITABLE',
          message: 'This setting is not editable',
        },
      });
    }

    setting.value = value;
    await setting.save();

    res.json({
      success: true,
      data: setting,
      message: 'Setting updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_SETTING_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Delete setting
 */
export const deleteSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const setting = await SystemSetting.findOne({ key });

    if (!setting) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SETTING_NOT_FOUND',
          message: 'Setting not found',
        },
      });
    }

    if (!setting.isEditable) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SETTING_NOT_DELETABLE',
          message: 'This setting cannot be deleted',
        },
      });
    }

    await SystemSetting.deleteOne({ key });

    res.json({
      success: true,
      message: 'Setting deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_SETTING_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Get lock date setting
 */
export const getLockDate = async (req: Request, res: Response) => {
  try {
    const setting = await SystemSetting.findOne({ key: 'LOCK_DATE' });

    res.json({
      success: true,
      data: {
        lockDate: setting?.value || null,
        isActive: setting?.isActive || false,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_LOCK_DATE_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Set lock date
 */
export const setLockDate = async (req: Request, res: Response) => {
  try {
    const { lockDate, isActive } = req.body;

    if (!lockDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_LOCK_DATE',
          message: 'Lock date is required',
        },
      });
    }

    const setting = await SystemSetting.findOneAndUpdate(
      { key: 'LOCK_DATE' },
      {
        value: new Date(lockDate),
        type: 'date',
        category: 'finance',
        description: 'Lock date for preventing edits before this date',
        isEditable: true,
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: setting,
      message: 'Lock date set successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SET_LOCK_DATE_ERROR',
        message: error.message,
      },
    });
  }
};
