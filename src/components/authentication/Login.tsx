import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Button, Col, Form, Row, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import axios, { AxiosError } from "axios";
// import '../../index.scss';

import logoImg from "../../assets/img/brand/FACTUREDLOGO.png";
import { checkSession } from "./SessionManager";
// import { checkSession } from './sessionManager';

interface SignInData {
    user: string;
    password: string;
}

const SignIn: React.FC = () => {
    const [err, setError] = useState<string>("");
    const [data, setData] = useState<SignInData>({
        user: "",
        password: "",
    });

    const { user, password } = data;

    const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setData({ ...data, [e.target.name]: e.target.value });
        setError("");
    };

    const navigate = useNavigate();

    const routeChange = () => {
        const path = `${import.meta.env.VITE_PUBLIC_URL}/inicio`;
        navigate(path);
    };

    const Login = (e: FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        void authenticate();
    };



    const authenticate = async () => {
        try {
            const response = await api.post<{
                AuthToken: string;
                User: string;
                ExpiresToken: string;
            }>("/v1/signin/", {
                User: data.user,
                Password: data.password,
            });

            const { AuthToken, User, ExpiresToken } = response.data;

            if (AuthToken && User && ExpiresToken) {
                    sessionStorage.setItem("AuthToken", AuthToken);
                    sessionStorage.setItem("User", User);
                    sessionStorage.setItem("ExpiresToken", ExpiresToken);

                    await checkSession();
                    routeChange();

            } else {
                setError(
                    "La respuesta del servidor no es la esperada. Inténtalo de nuevo."
                );
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                const responseData = axiosError.response?.data;

                // Asegúrate de que responseData sea un objeto antes de usar 'in'
                const errorMessage: string =
                    responseData &&
                        typeof responseData === "object" &&
                        "Message" in responseData
                        ? (responseData as { Message: string }).Message // Asegurar el tipo aquí
                        : "Ocurrió un error desconocido.";

                setError(errorMessage);
            } else {
                setError("Ocurrió un error desconocido. Inténtalo de nuevo.");
            }
        }
    };

    useEffect(() => {
        void checkSession(); // Si checkSession es asíncrona, asegúrate de esperarla en useEffect
    }, []); // Ejecutar una vez al montar el componente
    return (
        <React.Fragment>
            <div className="square-box"> 
            {/* Cambiar burbujas por logo  */}
                {" "}
                <div></div> <div></div> <div></div> <div></div> <div></div> <div></div>{" "}
                <div></div> <div></div> <div></div> <div></div> <div></div> <div></div>{" "}
                <div></div> <div></div> <div></div>{" "}
            </div>
            <div className="page bg-primary">
                <div className="page-single">
                    <div className="container" style={{marginTop: '30px'}}>
                        <Row>
                            <Col
                                xl={5}
                                lg={6}
                                md={8}
                                sm={8}
                                xs={10}
                                className="card-sigin-main mx-auto my-auto py-4 justify-content-center"
                            >
                                <div className="card-sigin">
                                    {/* <!-- Demo content--> */}
                                    <div className="main-card-signin d-md-flex">
                                        <div className="wd-100p">
                                            <div className="d-flex mb-4">
                                                <Link to="#">
                                                    <img
                                                        src={logoImg}
                                                        className="sign-favicon ht-40"
                                                        alt="logo"
                                                    />
                                                </Link>
                                            </div>
                                            <div className="">
                                                <div className="main-signup-header">
                                                    <h2>Bienvenido a Factured!</h2>
                                                    <h6 className="font-weight-semibold mb-4">
                                                        Por favor inicie sesion para continuar.
                                                    </h6>
                                                    <div className="panel panel-primary">
                                                        <div className=" tab-menu-heading mb-2 border-bottom-0">
                                                            <div className="tabs-menu1">
                                                                {err && <Alert variant="danger">{err}</Alert>}
                                                                <Form>
                                                                    <Form.Group className="form-group">
                                                                        <Form.Label className="">
                                                                            Usuario
                                                                        </Form.Label>{" "}
                                                                        <Form.Control
                                                                            className="form-control"
                                                                            placeholder="Ingrese su usuario"
                                                                            name="user"
                                                                            type="text"
                                                                            value={user}
                                                                            onChange={changeHandler}
                                                                            required
                                                                        />
                                                                    </Form.Group>
                                                                    <Form.Group className="form-group">
                                                                        <Form.Label>Contraseña</Form.Label>{" "}
                                                                        <Form.Control
                                                                            className="form-control"
                                                                            placeholder="Enter your password"
                                                                            name="password"
                                                                            type="password"
                                                                            value={password}
                                                                            onChange={changeHandler}
                                                                            required
                                                                        />
                                                                    </Form.Group>
                                                                    <Button
                                                                        variant=""
                                                                        type="submit"
                                                                        className="btn btn-primary btn-block"
                                                                        onClick={Login}
                                                                    >
                                                                        Iniciar sesión
                                                                    </Button>

                                                                    <div className="mt-4 d-flex text-center justify-content-center mb-2">
                                                                        <Link
                                                                            to="https://www.facebook.com/"
                                                                            target="_blank"
                                                                            className="btn btn-icon btn-facebook me-3"
                                                                            type="button"
                                                                        >
                                                                            <span className="btn-inner--icon">
                                                                                {" "}
                                                                                <i className="bx bxl-facebook tx-18 tx-prime"></i>{" "}
                                                                            </span>
                                                                        </Link>
                                                                        <Link
                                                                            to="https://www.twitter.com/"
                                                                            target="_blank"
                                                                            className="btn btn-icon me-3"
                                                                            type="button"
                                                                        >
                                                                            <span className="btn-inner--icon">
                                                                                {" "}
                                                                                <i className="bx bxl-twitter tx-18 tx-prime"></i>{" "}
                                                                            </span>
                                                                        </Link>
                                                                        <Link
                                                                            to="https://www.linkedin.com/"
                                                                            target="_blank"
                                                                            className="btn btn-icon me-3"
                                                                            type="button"
                                                                        >
                                                                            <span className="btn-inner--icon">
                                                                                {" "}
                                                                                <i className="bx bxl-linkedin tx-18 tx-prime"></i>{" "}
                                                                            </span>
                                                                        </Link>
                                                                        <Link
                                                                            to="https://www.instagram.com/"
                                                                            target="_blank"
                                                                            className="btn  btn-icon me-3"
                                                                            type="button"
                                                                        >
                                                                            <span className="btn-inner--icon">
                                                                                {" "}
                                                                                <i className="bx bxl-instagram tx-18 tx-prime"></i>{" "}
                                                                            </span>
                                                                        </Link>
                                                                    </div>
                                                                    <div className="main-signin-footer text-center mt-3">
                                                                        <p>
                                                                            <Link to="#" className="mb-3">
                                                                                Olvido su contraseña?
                                                                            </Link>
                                                                        </p>
                                                                    </div>
                                                                </Form>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

SignIn.propTypes = {};

SignIn.defaultProps = {};

export default SignIn;
