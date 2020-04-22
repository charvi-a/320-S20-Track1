# Written by Maeve Newman
# Updated 4/22/2020

import json
from package.query_db import query
from package.lambda_exception import LambdaException
import time
import datetime

# function puts the appointment details in the database
# Inputs: supporter_id, time_of_appt, type, duration, method, location
# Output: 201 Created
def lambda_handler(event, context):
    # take in lambda input
    student = int(event['student_id'])
    supporter = int(event['supporter_id'])
    time_of_appt = event['time_of_appt']
    appt_type = event['type']
    duration = int(event['duration'])
    method = event['method']
    location = event['location']
    
    if 'comment' in event:
        comment = event['comment']
    else:
        comment = ""
    
    # check that student is in DB
    sql = "SELECT student_id FROM students WHERE student_id = :student"
    sql_parameters = [
        {'name' : 'student', 'value': {'longValue': student}}
    ]
    check_student = query(sql, sql_parameters)

    # if student does not exist in DB, return error
    if(check_student['records'] == []):
        return{
            'body': json.dumps("Student not found."),
            'statusCode': 404
        }

    # check that supporter is in DB
    sql = "SELECT supporter_id FROM supporters WHERE supporter_id = :supporter"
    sql_parameters = [
        {'name' : 'supporter', 'value': {'longValue': supporter}}
    ]
    check_supporter = query(sql, sql_parameters)
    
    # if supporter does not exist in DB, return error
    if(check_supporter['records'] == []):
        return{
            'body': json.dumps("Supporter not found."),
            'statusCode': 404
        }
    
    # if supporter is in DB, set id variable for query
    student_id = student
    supporter_id = supporter
    
    # generate and set time_scheduled
    timestamp = time.time() - 240
    time_scheduled = datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')

    # generate and set appointment_id 
    sql = "SELECT appointment_id FROM scheduled_appointments ORDER BY appointment_id DESC LIMIT 1"
    sql_parameters = []
    id_query = query(sql,sql_parameters)
    appointment_id = id_query['records'][0][0]['longValue'] + 1

    # format query
    # NOTE: time_scheduled taken out of query pending DB updates
    # NOTE: student_id will NOT be stored in scheduled_appointments in DB update
    SQLquery = """INSERT INTO scheduled_appointments(appointment_id, supporter_id, time_of_appt, type, duration, location, method) \
        VALUES (:appointment_id, :supporter_id, TO_TIMESTAMP(:time_of_appt, 'YYYY-MM-DD HH24:MI:SS'), :appt_type, :duration, :location, :method)"""
    
    # format query parameters
    query_parameters = [
        {'name' : 'appointment_id', 'value': {'longValue' : appointment_id}},
        {'name' : 'supporter_id', 'value':{'longValue': supporter_id}},
        {'name' : 'student_id', 'value':{'longValue': student_id}},
        {'name' : 'time_of_appt', 'value':{'stringValue': time_of_appt}},
        {'name' : 'appt_type', 'value':{'stringValue': appt_type}},
        {'name' : 'duration', 'value': {'longValue' : duration}},
        {'name' : 'location', 'value':{'stringValue': location}},
        {'name': 'method', 'value':{'stringValue': method}},
        {'name' : 'time_scheduled', 'value': {'stringValue' : time_scheduled}},
        {'name' : 'comment', 'value':{'stringValue': comment}}
    ]

    # make query
    try:
        response = query(SQLquery, query_parameters)
    except Exception as e:
        return {
            'statusCode' : 404,
            'body' : "Update to scheduled appointment failed: " + str(e)
        }

    # query to update student_appointment_relation
    sql = "INSERT INTO student_appointment_relation (student_id, appointment_id, supporter_id, comment) VALUES (:student_id, :appointment_id, :supporter_id, :comment);"

    # update student_appointment_relation
    try:
        response = query(sql, query_parameters)
    except Exception as e:
        return {
            'statusCode' : 404,
            'body' : "Update to student appointment relation failed: " + str(e)
        }

    # if no error, return 201 Created
    return {
        'statusCode': 201, 
        'body': 'Appointment created.'
    }