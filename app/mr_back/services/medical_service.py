def get_mt_service(db, user):
    query = {'VTTicket.email': user['email']} if user['user_type'] == 1 else {}
    return list(db.medicalTickets.find(query, {'_id': 0}).sort([('priority', 1), ('startTime', 1)]))


def queue_position(db, user):
    # Return only an aggregate position; other patients' records never reach the browser.
    tickets = db.medicalTickets.find({}, {'VTTicket.email': 1}).sort([('priority', 1), ('startTime', 1)])
    for position, ticket in enumerate(tickets, 1):
        if ticket['VTTicket']['email'] == user['email']:
            return {'position': position}
    return {'position': None}
