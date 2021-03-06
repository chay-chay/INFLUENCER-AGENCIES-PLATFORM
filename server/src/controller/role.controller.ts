import { Request, Response } from "express";
import { createRole, findRoles } from "../services/role.service";
import logger from "../utils/logger";

export  const createRoleHandler = async (req: Request, res: Response) => {
    try {
        const role = await createRole(req.body);
        return res.status(200).json(role)
    } catch (e: any) {
        logger.error(e);
        return res.status(409).send(e.message);
      }
}

export const getRoleHandler = async(req: Request, res: Response)=> {

    const roles = await findRoles();
    
    return res.send(roles);
}