import {NextApiRequest, NextApiResponse} from "next";
import {stripe} from "../../lib/tripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { priceId } = req.body;
    const successUrl = `${process.env.NEXT_URL}/success`;
    const cancelUrl = `${process.env.NEXT_URL}/`;
    
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }
    
    if (! priceId) {
        return res.status(400).send('Missing priceId');
    }
    
    const checkoutSession = await stripe.checkout.sessions.create({
        success_url: successUrl,
        cancel_url: cancelUrl,
        mode: 'payment',
        line_items: [
            {
                price: priceId,
                quantity: 1 
            }
        ]
    })
    
    return res.status(201).json({
        checkoutUrl: checkoutSession.url,
    })
    
}
