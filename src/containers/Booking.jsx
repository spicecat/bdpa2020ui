import React, { useState, useEffect } from "react"
import { useParams } from 'react-router-dom'
import superagent from 'superagent'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import { object, string, date, number } from 'yup'
import { format } from "date-fns"
import Cookies from "universal-cookie"
import { requestUserInfo } from '../services/userService'
import { addTicket } from "../services/ticketService"
import flights_key from '../doNotCommit.js'
const cookies = new Cookies()
let flightRequestFails = 0
const Bookings = () => {
    const [userInfo, setUserInfo] = useState(false)
    const [flights, setFlights] = useState(false), [noFlyList, setNoFlyList] = useState(false) //, [shownFlights, setShownFlights] = useState(false)
    const [id] = useState(useParams().flight_id), [selected, setSelected] = useState()
    const [ticketResponse, setTicketResponse] = useState(2)
    const getUserInfo = async () => {
        if (cookies.get("email")) {
            setUserInfo(true)
            const requestedUserInfo = await requestUserInfo(cookies.get("email"))
            console.log("userInfo", requestedUserInfo)
            if (requestedUserInfo) {
                requestedUserInfo.birthdate = format(new Date(requestedUserInfo.birthdate), "yyyy-MM-dd")
                requestedUserInfo.cardName = ""
                requestedUserInfo.cvv = ""
                requestedUserInfo.expdate = ""
                requestedUserInfo.address = ""
                requestedUserInfo.seat = 1
                requestedUserInfo.checkedBags = 0
                requestedUserInfo.carryBags = 0
                setUserInfo(requestedUserInfo)
            }
        } else setUserInfo({
            firstName: "", middleName: "", lastName: "",
            birthdate: null, sex: "", email: "", phone: "",
            cardName: "", card: "", cvv: "", expdate: null,
            address: "", city: "", state: "", zip: "",
            seat: 0, checkedBags: 0, carryBags: 0
        })
    }
    const getNoFlyList = async () => {
        try {
            setNoFlyList(true)
            const response = await superagent.get('https://airports.api.hscc.bdpa.org/v2/info/no-fly-list').set('key', `${flights_key}`)
            console.log(response.body.noFlyList)
            setNoFlyList(response.body.noFlyList)
        } catch (err) { setNoFlyList(false) }
    }
    const makeFlightRequest = async (fields) => {
        setFlights(true)
        let myTargetIds, myURL
        if (id) myTargetIds = [id]

        var queryObject = {}
        queryObject["flight_id"] = `${myTargetIds}`
        console.log(queryObject)
        var query = encodeURIComponent(JSON.stringify(queryObject))

        myURL = "https://airports.api.hscc.bdpa.org/v2/flights?regexMatch=" + query
        console.log(myURL)
        try {
            const response = await superagent.get(myURL).set('key', `${flights_key}`)
            const flights = response.body.flights
            setFlights(flights)
            if (id) setSelected(flights[0])
            flightRequestFails = 0
        } catch (err) {
            flightRequestFails++
            console.error(err, flightRequestFails)
            console.log(flightRequestFails)
            setFlights(false)
        }
    }
    const searchFlights = fields => { }
    useEffect(() => { if (!noFlyList && flightRequestFails < 1) getNoFlyList() })
    useEffect(() => { if (!flights && flightRequestFails < 1) makeFlightRequest() })
    useEffect(() => { if (!userInfo) getUserInfo() })
    const handleSubmit = async fields => {
        const canFly = userInfo => !noFlyList.some(noFly => noFly.name.first === userInfo.firstName && noFly.name.last === userInfo.lastName
            && (!noFly.name.middle || !userInfo.middleName || noFly.name.middle === userInfo.middleName)
            && JSON.stringify(Object.values(noFly.birthdate).reverse()) === JSON.stringify(userInfo.birthdate.split('-').map(i => Number(i)))
            && noFly.sex === userInfo.sex)
        if (canFly(fields)) {
            setTicketResponse(3)
            const response = await addTicket(id,fields.seat)
            setTicketResponse(0 + response)
        } else setTicketResponse(4)
    }
    const required = string().required('Required')
    return (
        <>
            <div align='center'>
                <div className='col-sm-8'>
                    <hr />
                    <h2>Book Flights</h2>
                    <hr />
                    {flightRequestFails >= 8 && <h3>Flight Could Not Be Requested</h3>}
                    {selected && <>
                        <h3 align='center'>Frequent Flyer Miles Awarded: {selected.ffms}</h3>
                        <h3 align='center'>Price: {selected.seatPrice}</h3>
                        <h3 align='center'>Arriving: {new Date(selected.arriveAtReceiver).toLocaleString()}</h3>
                        <h3 align='center'>To: {selected.landingAt} From: {selected.comingFrom}</h3>
                    </>}
                    {!id && <Formik
                        initialValues={{ location: "", search: "", date: "" }}
                        validationSchema={object().shape({
                            location: required, search: required, date: required
                        })}
                        onSubmit={searchFlights}
                    >
                        {({ errors, touched }) => (
                            (id === null || id === undefined || id === "") &&
                            <Form>
                                <div className="form-row">
                                    <div className="form-group col">
                                        <label htmlFor="search">Arrival Location</label>
                                        <Field name="location" as="select" className={'form-control' + (errors.location ? ' is-invalid' : '')}>
                                            <option value="" ></option>
                                            <option value="city" >City</option>
                                            <option value="state">State</option>
                                            <option value="country">Country</option>
                                            <option value="airport">Airport</option>
                                        </Field>
                                        <ErrorMessage name="location" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col">
                                        <label htmlFor="search">Search</label>
                                        <Field name="search" type="text" className={'form-control' + (errors.search && touched.search ? ' is-invalid' : '')} />
                                        <ErrorMessage name="search" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col">
                                        <label htmlFor="date">Date</label>
                                        <Field name="date" type="text" className={'form-control' + (errors.date && touched.date ? ' is-invalid' : '')} />
                                        <ErrorMessage name="date" component="div" className="invalid-feedback" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <button type="submit" className="btn btn-primary mr-2">Search</button>
                                    <button type="reset" className="btn btn-secondary">Reset</button>
                                </div>
                            </Form>)}
                    </Formik>}
                    {userInfo && userInfo !== true && <Formik
                        initialValues={userInfo}
                        validationSchema={object().shape({
                            firstName: required, lastName: required,
                            birthdate: date().required("Required").max(new Date(), "Invalid Date of Birth"), sex: required,
                            email: required.email('Email is invalid'), phone: required.matches(/^[0-9]+$/, "Can only contain numbers"),
                            cardName: required,
                            card: required.matches(/^[0-9]+$/, "Can only cantain numbers"), cvv: required.matches(/^[0-9]+$/, "Can only cantain numbers"),
                            expdate: date().required("Required").min(new Date((new Date()).getYear() + 1900, (new Date()).getMonth()), "Invalid Expiration Date"),
                            address: required, city: required, state: required, zip: required,
                            seat: number().required('Required'), checkedBags: number().required('Required'), carryBags: number().required('Required')
                        })}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched }) => (
                            <Form>
                                <h4>Identifying Information</h4>
                                <div className="form-row">
                                    <div className="form-group col">
                                        <label htmlFor="firstName">First Name</label>
                                        <Field name="firstName" type="text" className={'form-control' + (errors.firstName && touched.firstName ? ' is-invalid' : '')} />
                                        <ErrorMessage name="firstName" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col">
                                        <label htmlFor="middleName">Middle Name</label>
                                        <Field name="middleName" type="text" className="form-control" />
                                    </div>
                                    <div className="form-group col">
                                        <label htmlFor="lastName">Last Name</label>
                                        <Field name="lastName" type="text" className={'form-control' + (errors.lastName && touched.lastName ? ' is-invalid' : '')} />
                                        <ErrorMessage name="lastName" component="div" className="invalid-feedback" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group col">
                                        <label htmlFor="birthdate">Date of Birth</label>
                                        <Field name="birthdate" type="date" max={format(Date.now(), "yyyy-MM-dd")} className={'form-control' + (errors.birthdate && touched.birthdate ? ' is-invalid' : '')} />
                                        <ErrorMessage name="birthdate" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col">
                                        <label>Sex</label>
                                        <Field name="sex" as="select" className={'form-control' + (errors.sex && touched.sex ? ' is-invalid' : '')}>
                                            <option value=""></option>
                                            <option value="male" >Male</option>
                                            <option value="female" >Female</option>
                                            <option value="other">Genderqueer/Non-Binary</option>
                                        </Field>
                                        <ErrorMessage name="sex" component="div" className="invalid-feedback" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group col">
                                        <label htmlFor="phone">Phone Number</label>
                                        <Field name="phone" type="text" className={'form-control' + (errors.phone && touched.phone ? ' is-invalid' : '')} />
                                        <ErrorMessage name="phone" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col">
                                        <label htmlFor="email">Email Address</label>
                                        <Field name="email" type="email" disabled={userInfo} className={'form-control' + (errors.email && touched.email ? ' is-invalid' : '')} />
                                        <ErrorMessage name="email" component="div" className="invalid-feedback" />
                                    </div>
                                </div>
                                <h4>Payment Information</h4>
                                <div className="form-group">
                                    <label htmlFor="cardName">Cardholder Name</label>
                                    <Field name="cardName" type="text" className={'form-control' + (errors.cardName && touched.cardName ? ' is-invalid' : '')} />
                                    <ErrorMessage name="cardName" component="div" className="invalid-feedback" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group col">
                                        <label htmlFor="card">Card Number</label>
                                        <Field name="card" type="text" className={'form-control' + (errors.card && touched.card ? ' is-invalid' : '')} />
                                        <ErrorMessage name="card" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col-3">
                                        <label htmlFor="cvv">CVV</label>
                                        <Field name="cvv" type="expdate" className={'form-control' + (errors.cvv && touched.cvv ? ' is-invalid' : '')} />
                                        <ErrorMessage name="cvv" component="div" className="invalid-feedback" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="expdate">Expiration Date</label>
                                    <Field name="expdate" type="month" min={format(Date.now(), "yyyy-MM")} className={'form-control' + (errors.expdate && touched.expdate ? ' is-invalid' : '')} />
                                    <ErrorMessage name="expdate" component="div" className="invalid-feedback" />
                                </div>
                                <h4>Billing Address</h4>
                                <div className="form-row">
                                    <div className="form-group col">
                                        <label htmlFor="address">Address</label>
                                        <Field name="address" type="text" className={'form-control' + (errors.address && touched.address ? ' is-invalid' : '')} />
                                        <ErrorMessage name="address" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col">
                                        <label htmlFor="city">City</label>
                                        <Field name="city" type="text" className={'form-control' + (errors.city && touched.city ? ' is-invalid' : '')} />
                                        <ErrorMessage name="city" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col">
                                        <label htmlFor="state">State</label>
                                        <Field name="state" type="text" className={'form-control' + (errors.state && touched.state ? ' is-invalid' : '')} />
                                        <ErrorMessage name="state" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col">
                                        <label htmlFor="zip">Zip</label>
                                        <Field name="zip" type="text" className={'form-control' + (errors.zip && touched.zip ? ' is-invalid' : '')} />
                                        <ErrorMessage name="zip" component="div" className="invalid-feedback" />
                                    </div>
                                </div>
                                <h4>Passenger Information</h4>
                                <div className="form-row">
                                    <div className="form-group col">
                                        <label htmlFor="seat">Seat Number</label>
                                        <Field name="seat" type="number" min="1" max="21" className={'form-control' + (errors.seat && touched.seat ? ' is-invalid' : '')} />
                                        <ErrorMessage name="seat" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col">
                                        <label htmlFor="checkedBags">Checked Bags</label>
                                        <Field name="checkedBags" type="number" min="0" max="5" className={'form-control' + (errors.checkedBags && touched.checkedBags ? ' is-invalid' : '')} />
                                        <ErrorMessage name="checkedBags" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col">
                                        <label htmlFor="carryBags">Carry-on Bags</label>
                                        <Field name="carryBags" type="number" min="0" max="2" className={'form-control' + (errors.carryBags && touched.carryBags ? ' is-invalid' : '')} />
                                        <ErrorMessage name="carryBags" component="div" className="invalid-feedback" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <button type="submit" className="btn btn-primary mr-2" disabled={flightRequestFails >= 8}>Book Flight</button>
                                    <button type="reset" className="btn btn-secondary">Reset</button>
                                </div>
                                <hr />
                                <h5>{["Ticket Not Saved", "Ticket Saved", "", "Loading...", "You're on the No Fly List"][ticketResponse]}</h5>
                            </Form>
                        )}
                    </Formik>}
                </div>
            </div>
        </>
    )
}

export default Bookings
