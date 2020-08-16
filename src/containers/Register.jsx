import React, { useState } from "react"
// import { Form, Button, Col } from "react-bootstrap"
import { Formik, Field, Form, ErrorMessage } from 'formik'
import { object, string, date } from 'yup'
import { parse, isDate } from "date-fns"
import { createUser } from "../services/userService"
const securityQuestions = [
    "What was the house number and street name you lived in as a child?",
    "What primary school did you attend?",
    "What is your favorite food?"
]
const Register = () => {
    const [validUsername, setUsernameValidity] = useState(2)
    const handleSubmit = async (fields) => {
        const { captcha, ...info } = fields
        info.birthdate = new Date(info.birthdate)
        setUsernameValidity(3)
        const response = await createUser(info)
        setUsernameValidity(0 + response)
        if (response) window.setTimeout(() => window.open("/login", "_top"), 1000)
    }
    const required = string().required('Required')
    return (
        <>
            <div align='center'>
                <div className='col-sm-8'>
                    <hr />
                    <h2>Register Customer Account</h2>
                    <hr />
                    <p>You are only moments away from joining the best website in the world! Please enter some personal information and we'll get your account set up right away.</p>
                    <p>As a customer, you are given access to a wide variety of services. Join today!</p>
                    <hr />
                    <Formik
                        initialValues={{
                            title: "", firstName: "", middleName: "", lastName: "", suffix: "",
                            birthdate: "", sex: "", city: "", state: "", zip: "", country: "",
                            email: "", phone: "", username: "", password: "",
                            securityQuestion1: "", securityQuestion2: "", securityQuestion3: "", captcha: ""
                        }}
                        validationSchema={object().shape({
                            username: required.matches(/^[a-zA-Z0-9]+$/, "Cannot contain special characters or spaces"),
                            firstName: required, lastName: required,
                            birthdate: date().required("Required").transform((originalValue) => {
                                return isDate(originalValue) ? originalValue : parse(originalValue, "yyyy-MM-dd", new Date());
                            }).max(new Date()),
                            sex: required, city: required, state: required, zip: required, country: required,
                            email: required.email('Email is invalid'), phone: string().matches(/^[0-9]+$/, "Can only contain numbers"),
                            password: required
                                .min(10, 'Must be at least 10 characters')
                                .max(30, "Must be less than 30 characters")
                                .matches(
                                    /^[a-zA-Z0-9!@#$%^&*?_~]+$/,
                                    "Cannot contain special characters or spaces"
                                ),
                            securityQuestion1: required, securityQuestion2: required, securityQuestion3: required,
                            captcha: required.matches("78", 'Invalid Captcha')
                        })}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched }) => (
                            <Form>
                                <div className="form-row">
                                    <div className="form-group col-2">
                                        <label htmlFor="title">Title</label>
                                        <Field name="title" type="text" className="form-control" />
                                    </div>
                                    <div className="form-group col-3">
                                        <label htmlFor="firstName">First Name</label>
                                        <Field name="firstName" type="text" className={'form-control' + (errors.firstName && touched.firstName ? ' is-invalid' : '')} />
                                        <ErrorMessage name="firstName" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col-3">
                                        <label htmlFor="middleName">Middle Name</label>
                                        <Field name="middleName" type="text" className="form-control" />
                                    </div>
                                    <div className="form-group col-3">
                                        <label htmlFor="lastName">Last Name</label>
                                        <Field name="lastName" type="text" className={'form-control' + (errors.lastName && touched.lastName ? ' is-invalid' : '')} />
                                        <ErrorMessage name="lastName" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col-1">
                                        <label htmlFor="suffix">Suffix</label>
                                        <Field name="suffix" type="text" className="form-control" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group col">
                                        <label htmlFor="birthdate">Date of Birth YYYY/MM/DD</label>
                                        <Field name="birthdate" type="text" className={'form-control' + (errors.birthdate && touched.birthdate ? ' is-invalid' : '')} />
                                        <ErrorMessage name="birthdate" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col">
                                        <label>Sex</label>
                                        <Field name="sex" as="select" className={'form-control' + (errors.sex && touched.sex ? ' is-invalid' : '')}>
                                            <option value=""></option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Genderqueer/Non-Binary</option>
                                        </Field>
                                        <ErrorMessage name="sex" component="div" className="invalid-feedback" />
                                    </div>
                                </div>
                                <div className="form-row">
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
                                    <div className="form-group col">
                                        <label htmlFor="country">Country</label>
                                        <Field name="country" type="text" className={'form-control' + (errors.country && touched.country ? ' is-invalid' : '')} />
                                        <ErrorMessage name="country" component="div" className="invalid-feedback" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group col">
                                        <label htmlFor="phone">Phone Number</label>
                                        <Field name="phone" type="text" className={'form-control' + (errors.phone ? ' is-invalid' : '')} />
                                        <ErrorMessage name="phone" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group col">
                                        <label htmlFor="email">Email Adress</label>
                                        <Field name="email" type="email" className={'form-control' + (errors.email && touched.email ? ' is-invalid' : '')} />
                                        <ErrorMessage name="email" component="div" className="invalid-feedback" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <Field name="username" type="text" className={'form-control' + (errors.username && touched.username ? ' is-invalid' : '')} />
                                    <ErrorMessage name="username" component="div" className="invalid-feedback" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <Field name="password" type="password" className={'form-control' + (errors.password && touched.password ? ' is-invalid' : '')} />
                                    <ErrorMessage name="password" component="div" className="invalid-feedback" />
                                </div>
                                <h4>Security Questions</h4>
                                <div className="form-group">
                                    <label htmlFor="securityQuestion1">{securityQuestions[0]}</label>
                                    <Field name="securityQuestion1" type="text" className={'form-control' + (errors.securityQuestion1 && touched.securityQuestion1 ? ' is-invalid' : '')} />
                                    <ErrorMessage name="securityQuestion1" component="div" className="invalid-feedback" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="securityQuestion2">{securityQuestions[1]}</label>
                                    <Field name="securityQuestion2" type="text" className={'form-control' + (errors.securityQuestion2 && touched.securityQuestion2 ? ' is-invalid' : '')} />
                                    <ErrorMessage name="securityQuestion2" component="div" className="invalid-feedback" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="securityQuestion3">{securityQuestions[2]}</label>
                                    <Field name="securityQuestion3" type="text" className={'form-control' + (errors.securityQuestion3 && touched.securityQuestion3 ? ' is-invalid' : '')} />
                                    <ErrorMessage name="securityQuestion3" component="div" className="invalid-feedback" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="captcha">What's 47+31?</label>
                                    <Field name="captcha" type="text" className={'form-control' + (errors.captcha && touched.captcha ? ' is-invalid' : '')} />
                                    <ErrorMessage name="captcha" component="div" className="invalid-feedback" />
                                </div>
                                <div className="form-group">
                                    <button type="submit" className="btn btn-primary mr-2">Register</button>
                                    <button type="reset" className="btn btn-secondary">Reset</button>
                                </div>
                                <h5>{["Username Already Taken", "User Registered!", "", "Loading..."][validUsername]}</h5>
                            </Form>
                        )}
                    </Formik>

                </div>
                <div className='col-sm-3' />
            </div>
        </>
    )
}
export default Register