import { selectThemeMode, setIsLoggedInAC } from "@/app/app-slice";
import { AUTH_TOKEN } from "@/common/constants";
import { ResultCode } from "@/common/enums";
import { useAppDispatch, useAppSelector } from "@/common/hooks";
import { getTheme } from "@/common/theme";
import { useLoginMutation } from "@/features/auth/api/authApi";
import { type Inputs, loginSchema } from "@/features/auth/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import styles from "./Login.module.css";
import { useGetCaptchaUrlQuery } from "@/features/security/api/security_api";
import { useState } from "react";

export const Login = () => {
  const themeMode = useAppSelector(selectThemeMode);
  const dispatch = useAppDispatch();
  const theme = getTheme(themeMode);

  const [login] = useLoginMutation();
  const [captchaRequired, setCaptchaRequired] = useState(false);

  const {
    data: captcha,
    refetch: refetchCaptcha,
  } = useGetCaptchaUrlQuery(undefined, { skip: !captchaRequired });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
      captcha: "",
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const res = await login(data);

    if ("data" in res) {
      const resultCode = res.data?.resultCode;

      if (resultCode === ResultCode.Success && res.data?.data.token) {
        dispatch(setIsLoggedInAC({ isLoggedIn: true }));
        localStorage.setItem(AUTH_TOKEN, res.data.data.token);
        reset();
        setCaptchaRequired(false);
      } else if (resultCode === ResultCode.CaptchaError) {
        setCaptchaRequired(true);
        refetchCaptcha();
      }
    }
  };

  return (
    <Grid container justifyContent={"center"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl>
          <FormLabel>
            <p>
              To login get registered
              <a
                style={{ color: theme.palette.primary.main, marginLeft: "5px" }}
                href="https://social-network.samuraijs.com"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
            </p>
            <p>or use common test account credentials:</p>
            <p>
              <b>Email:</b> free@samuraijs.com
            </p>
            <p>
              <b>Password:</b> free
            </p>
          </FormLabel>

          <FormGroup>
            <TextField label="Email" margin="normal" error={!!errors.email} {...register("email")} />
            {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}

            <TextField
              type="password"
              label="Password"
              margin="normal"
              error={!!errors.password}
              {...register("password")}
            />
            {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}

            <FormControlLabel
              label={"Remember me"}
              control={
                <Controller
                  name={"rememberMe"}
                  control={control}
                  render={({ field: { value, ...field } }) => <Checkbox {...field} checked={value} />}
                />
              }
            />

            {/* 👇 Показываем капчу только если она требуется */}
            {captchaRequired && captcha?.url && (
              <>
                <img src={captcha.url} alt="captcha" style={{ marginTop: "10px" }} />
                <TextField
                  label="Captcha"
                  margin="normal"
                  error={!!errors.captcha}
                  {...register("captcha")}
                />
                {errors.captcha && (
                  <span className={styles.errorMessage}>{errors.captcha.message}</span>
                )}
              </>
            )}

            <Button type="submit" variant="contained" color="primary">
              Login
            </Button>
          </FormGroup>
        </FormControl>
      </form>
    </Grid>
  );
};
