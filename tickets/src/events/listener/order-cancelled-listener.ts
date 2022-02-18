import { Listener, OrderStatus } from '@mh132001tickets/common';
import { OrderCancelledEvent } from '@mh132001tickets/common';
import { Subjects } from '@mh132001tickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const ticket = await Ticket.findOne({id: data.ticket.id});

        if (!ticket){
            throw new Error('Ticket not found!');
        }

        ticket.orderId = undefined;
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        })

        msg.ack();
    }

}