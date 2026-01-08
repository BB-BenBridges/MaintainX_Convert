// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const requestOptions = {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${process.env.MAINTAINX_API_KEY || ""}`,
    },
  }
  const wo = await fetch(`https://api.getmaintainx.com/v1/workorders/${req.query.id}?expand=location&useSequentialId=true&expand=asset`, requestOptions)
    .then((response) => response.json())

  res.status(200).json(wo.workOrder);
}
