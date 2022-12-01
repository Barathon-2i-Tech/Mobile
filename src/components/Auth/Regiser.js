/* eslint-disable react/prop-types */
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Dimensions,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import Colors from "../../constants/colors";
import Axios from "../../constants/axios";
import { storeDataObject } from "../../constants/localStorage";
import { Formik } from "formik";
import * as Yup from "yup";

export default function Register({ navigation }) {
  const [date, setDate] = useState(new Date());
  const [selectDate, setSelectDate] = useState(false);
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onChange = (event) => {
    setShow(false);

    if (event["nativeEvent"]["timestamp"] != undefined) {
      setSelectDate(true);
      setDate(new Date(event["nativeEvent"]["timestamp"]));
    }
  };

  const showMode = () => {
    if (Platform.OS === "android") {
      setShow(false);
      // for iOS, add a button that closes the picker
    }
  };

  const showDatepicker = () => {
    if (show == false) {
      setShow(true);
    } else {
      showMode();
    }
  };

  const checkBirth = () => {
    let age = Date.now() - date.getTime();
    let age_dt = new Date(age);
    let year = age_dt.getUTCFullYear();
    age = Math.abs(year - 1970);

    if (
      date.toString().substring(0, 10) == new Date().toString().substring(0, 10)
    ) {
      alert("Veuillez saisir votre date de naissance !");
    } else if (age < 18) {
      alert("Vous ne pouvez pas accéder à l'application en tant que mineur !");
    } else {
      setStep(step + 1);
    }
  };

  const login = (values) => {
    setEmail(values.email);
    setPassword(values.password);
    setConfirmPassword(values.confirmPassword);
    setStep(step + 1);
  };

  const personnalInfo = (values) => {
    console.log(values.postal_code)
    console.log(email)
    console.log(password)
    console.log(confirmPassword)
    console.log(date)
    Axios.api
      .post(
        "/register/barathonien",
        {
          email: email,
          password: password,
          password_confirmation: confirmPassword,
          first_name: values.first_name,
          last_name: values.last_name,
          birthday: date,
          adress: values.adress,
          postal_code: values.postal_code,
          city: values.city,
        },
        {
          headers: {
            "Accept": "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
          },
        }
      )
      .then((response) => {
        console.log("la response : ", response.data.data);

        if (response.data.data["user"]["barathonien_id"] != null) {
          storeDataObject("user", response.data.data);
          navigation.navigate("Home");
        } else {
          alert(
            "Vous pouvez vous connecter sur l'application mobile qu'avec un compte barathonien !"
          );
        }
      })
      .catch((e) => {
        console.log(e.toJSON());
      });
  };

  const SignupSchema = Yup.object().shape({
    email: Yup.string()
      .required("Veuillez saisir votre email")
      .email("Veuillez saisir une adresse email"),
    password: Yup.string()
      .min(8, "Trop court! >8")
      .required("Veuillez saisir votre mot de passe"),
    confirmPassword: Yup.string().oneOf(
      [Yup.ref("password"), null],
      "Passwords must match"
    ),
  });

  const SignupSchema2 = Yup.object().shape({
    last_name: Yup.string().required("Veuillez saisir votre nom"),
    first_name: Yup.string().required("Veuillez saisir votre prénom"),
    adress: Yup.string().required("Veuillez saisir votre adresse"),
    postal_code: Yup.string()
      .min(5, "Trop court! = 5")
      .max(5, "Trop long! = 5")
      .required("Veuillez saisir votre code postal"),
    city: Yup.string().required("Veuillez saisir votre adresse"),
  });

  return (
    <View style={styles.mainContainer}>
      {step == 1 && (
        <>
          <Text style={styles.title}>
            Avant de commencer, nous devons verifier que tu as plus de 18 ans
          </Text>
          <Pressable style={styles.btnDate} onPress={showDatepicker}>
            {!selectDate ? (
              <Text style={styles.buttonText}>saisir ta date de naissance</Text>
            ) : (
              <Text style={styles.buttonText}>{date.toDateString()}</Text>
            )}
          </Pressable>
          <Pressable style={styles.valider} onPress={checkBirth}>
            <Text style={styles.buttonText}>Verifier</Text>
          </Pressable>
          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={"date"}
              is24Hour={true}
              onChange={onChange}
            />
          )}
        </>
      )}

      {step == 2 && (
        <>
          <Formik
            initialValues={{ email: "", password: "", confirmPassword: "" }}
            validationSchema={SignupSchema}
            onSubmit={(values) => login(values)}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
              <>
                <Text style={styles.title}>
                  Nous avons besoin que tu renseigne tes futurs identifiants de
                  connexion
                </Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  placeholder="Email"
                  keyboardType="email-adress"
                />
                {errors.email && (
                  <Text style={{ fontSize: 10, color: "red" }}>
                    {errors.email}
                  </Text>
                )}
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  placeholder="Mot de passe"
                  keyboardType="default"
                />
                {errors.password && (
                  <Text style={{ fontSize: 10, color: "red" }}>
                    {errors.password}
                  </Text>
                )}
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                  placeholder="Confirmer votre Mot de passe"
                  keyboardType="default"
                />
                {errors.confirmPassword && (
                  <Text style={{ fontSize: 10, color: "red" }}>
                    {errors.confirmPassword}
                  </Text>
                )}
                <Pressable onPress={handleSubmit} style={styles.valider}>
                  <Text style={styles.buttonText}>Etape suivante</Text>
                </Pressable>
              </>
            )}
          </Formik>
        </>
      )}

      {step == 3 && (
        <>
          <Formik
            initialValues={{
              last_name: "",
              first_name: "",
              adress: "",
              code_postal: "",
              city: "",
            }}
            validationSchema={SignupSchema2}
            onSubmit={(values) => personnalInfo(values)}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
              <>
                <Text style={styles.title2}>Dernière étape !</Text>
                <Text style={styles.title}>Parle nous un peu de toi</Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputFlex}
                    onChangeText={handleChange("last_name")}
                    onBlur={handleBlur("last_name")}
                    value={values.last_name}
                    placeholder="Nom"
                    keyboardType="default"
                  />

                  <TextInput
                    style={styles.inputFlex}
                    onChangeText={handleChange("first_name")}
                    onBlur={handleBlur("first_name")}
                    value={values.first_name}
                    placeholder="Prenom"
                    keyboardType="default"
                  />
                </View>
                <View style={styles.inputContainer}>
                  {errors.last_name && (
                    <Text style={{ fontSize: 10, color: "red" }}>
                      {errors.last_name}
                    </Text>
                  )}
                  {errors.first_name && (
                    <Text style={{ fontSize: 10, color: "red" }}>
                      {errors.first_name}
                    </Text>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("adress")}
                  onBlur={handleBlur("adress")}
                  value={values.adress}
                  placeholder="N° et nom de ta rue"
                  keyboardType="default"
                />
                {errors.adress && (
                  <Text style={{ fontSize: 10, color: "red" }}>
                    {errors.adress}
                  </Text>
                )}
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("postal_code")}
                  onBlur={handleBlur("postal_code")}
                  value={values.postal_code}
                  placeholder="Code Postal"
                  keyboardType="numeric"
                />
                {errors.postal_code && (
                  <Text style={{ fontSize: 10, color: "red" }}>
                    {errors.postal_code}
                  </Text>
                )}
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("city")}
                  onBlur={handleBlur("city")}
                  value={values.city}
                  placeholder="Ville"
                  keyboardType="default"
                />
                {errors.city && (
                  <Text style={{ fontSize: 10, color: "red" }}>
                    {errors.city}
                  </Text>
                )}
                <Pressable onPress={handleSubmit} style={styles.valider}>
                  <Text style={styles.buttonText}>C&apos;est parti !</Text>
                </Pressable>
              </>
            )}
          </Formik>
        </>
      )}
    </View>
  );
}

const width = Dimensions.get("window").width;
//const height = Dimensions.get("window").height; //full height

const styles = StyleSheet.create({
  mainContainer: {
    width: width / 1.1,
    marginLeft: width / 25,
  },

  inputContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  inputFlex: {
    backgroundColor: "#F0F0F0",
    height: 50,
    width: width / 2.5,
    borderRadius: 5,
    marginTop: 30,
    paddingLeft: 15,
  },

  input: {
    backgroundColor: "#F0F0F0",
    height: 50,
    borderRadius: 5,
    marginTop: 30,
    paddingLeft: 15,
  },

  title: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 15,
  },

  title2: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },

  btnDate: {
    backgroundColor: Colors.primary,
    height: 40,
    width: width / 1.5,
    alignItems: "center",
    marginLeft: 50,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    paddingTop: 6,
  },

  valider: {
    backgroundColor: Colors.accent,
    marginTop: 30,
    width: width / 1.5,
    marginLeft: 50,
    height: 40,
    borderRadius: 10,
    marginBottom: 20,
  },
});
