import { useEffect, useReducer, useRef, useState } from "react";
import {
    Box,
    Button,
    CardBody,
    CircularProgress,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Grid,
    GridItem,
    Icon,
    Input,
    Select,
    Card,
    Text,
} from "@chakra-ui/react";
import * as Yup from "yup";
import { api, AppPageProps, socket_client } from "../App.js";
import { FaRegSmile } from "react-icons/fa";
import {
    FaBolt,
    FaGauge,
    FaHourglassHalf,
    FaRegHeart,
    FaRegStar,
    FaWhiskeyGlass,
} from "react-icons/fa6";
import { IconType } from "react-icons/lib";
import { Patient, PatientEditFormPage } from "./PatientPage.js";
import { Formik, Form, Field } from "formik";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Filler,
    Title
} from "chart.js";

// Registering the necessary components for Chart.js
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Filler, Title);

const chartOptions = {
    responsive: true,
    scales: {
        x: {
            title: {
                display: true,
                text: "Kecepatan Tetes Infus (tetes/menit)",
            },
        },
    },
    plugins: {
        title:{
            display: true,
            text: "Grafik Kecepatan Tetes Infus",
        }
    }
};

export interface Machine {
    id: string;
    unique: string;
    patient: string;
    infus_volume: number;
    infus_rate: number[];
    infus_rate_recommendation: number;
    infus_factor: string;
    machine_failure: boolean;
}

function calculateInfusTime(volume: number, tpm: number, factor: string) {
    if (volume <= 0 || tpm <= 0) return { jam: 0, menit: 0 }; // Validasi input

    let factorValue: number;
    switch (factor) {
        case "micro":
            factorValue = 60;
            break;
        case "transfusion":
            factorValue = 15;
            break;
        case "macro":
            factorValue = 20;
            break;
        default:
            return { jam: 0, menit: 0 }; // Faktor tidak valid
    }

    const ratePerMinute = tpm / factorValue;
    if (ratePerMinute <= 0) return { jam: 0, menit: 0 }; // Validasi laju infus

    const time = volume / ratePerMinute;
    const jam = Math.floor(time / 60);
    const menit = Math.round(time % 60);

    return { jam, menit };
}

function MonitoringPage(props: AppPageProps) {
    const data = useRef(props.data||{});
    const machines: Machine[] = data.current?.machines || [];
    const patients: Patient[] = data.current?.patients || [];

    const [loading, setLoading] = useState(true);
    const [machineIndex, setMachineIndex] = useState(0);
    const [patientIndex, setPatientIndex] = useState(-1);
    const renderCount = useRef(-1);
    const [, forceRender] = useReducer(x => x+1, -1);

    const machine = machines[machineIndex];
    const patient = patients[patientIndex];

    const [chartData, setChartData] = useState<any>({
    labels: Array.from({ length: 60 }, (_, index) => "Detik "+(index + 1)), // Sumbu X dari 1 hingga 60
    datasets: [
            {
                label: "Contoh Data",
                data: Array.from(
                    { length: machines.length },
                    (_, index) => 0
                ), // Data Y
                borderColor: "#8884d8",
                backgroundColor: "rgba(136, 132, 216, 0.2)",
                fill: true,
            },
        ],
    });

    useEffect(() => {
        if (machines.length > 0) {
            const initialPatientIndex = patients.findIndex(
                (patient) => patient.id === machines[0]?.patient
            );
            setPatientIndex(initialPatientIndex);
        }
        setChartData({
                labels: Array.from(
                    { length: 60 },
                    (_, index) => "Detik " + (index + 1)
                ), // Sumbu X dari 1 hingga 60
                datasets: [
                    {
                        label: "TPM",
                        data: Array.from(
                            { length: machine? machine.infus_rate.length : 0 },
                            (_, index) => machine ? machine.infus_rate[index] : 0
                                
                        ), // Data Y
                        borderColor: "#8884d8",
                        backgroundColor: "rgba(136, 132, 216, 0.2)",
                        fill: true,
                    },
                ],
            });
    }, [data.current, machines, patients, machineIndex]);
    
    useEffect(() => {
        socket_client.on("machines_update", (newData) => {
            data.current.machines = newData;
            forceRender();
        });
        return () => {
            socket_client.off("machines_update");
        }
    }, [data.current])

    useEffect(() => {
        if (renderCount.current == 0 && loading) {
            api.get("/machines")
                .then((res) => {
                    const result = res.data;
                    if (result.code >= 200 && result.code <= 300) {
                        data.current = result.data
                    } else
                        props.showToast({
                            title: result.message,
                            status: "error",
                        });
                })
                .catch((err) => {
                    console.error(err);
                    props.showToast({
                        title: "Gagal mengambil data",
                        status: "error",
                    });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
        return () => {
            socket_client.off("machines_update");
            renderCount.current++;
        };
    }, []);

    const saveMachine = () => {
        setLoading(true);
        api.patch("/machine/" + machine.id, machine)
            .then((res) => {
                const result = res.data;
                if (result.code >= 200 && result.code <= 300) {
                    if (machines) data.current.machines[machineIndex] = result.data;
                } else
                    props.showToast({
                        title: result.message,
                        status: "error",
                    });
            })
            .catch((err) => {
                console.error(err);
                props.showToast({
                    title: "Gagal memperbarui data",
                    status: "error",
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const { jam, menit } = calculateInfusTime(machine?.infus_volume || 0, machine?.infus_rate[machine.infus_rate.length-1] || 0, machine?.infus_factor || "micro");

    return !loading && machines && machines.length > 0 ? (
        <Grid templateColumns={"repeat(4, 1fr)"} gap={4} pb={4}>
            <GridItem colSpan={1}>
                <Select
                    id="gender"
                    w="auto"
                    name="gender"
                    background="white"
                    value={machineIndex}
                    onChange={(e) => {
                        setMachineIndex(parseInt(e.target.value));
                    }}
                >
                    {machines.map((machine: Machine, i) => (
                        <option key={i} value={i}>
                            {machine.unique}
                        </option>
                    ))}
                </Select>
            </GridItem>

            <GridItem colSpan={3} />

            <DashboardCard
                title={`${machine?.infus_volume || "0"} mL`}
                subtitle="Volume Infus"
                icon={FaWhiskeyGlass}
                cardColor="green.400"
            />
            <DashboardCard
                title={`${
                    machine?.infus_rate[machine.infus_rate.length - 1] || "0"
                } tpm`}
                subtitle="Kecepatan Tetesan Infus"
                icon={FaGauge}
            />
            <DashboardCard
                title={`${jam} jam ${menit} menit`}
                subtitle="Habis dalam"
                icon={FaHourglassHalf}
            />
            <Flex
                flexDirection="column"
                borderRadius="md"
                background="white"
                h="100%"
                justifyContent="center"
                w="100%"
                py={6}
                p={4}
                boxShadow="sm"
            >
                <Text fontWeight="bold">Rekomendasi kecepatan:</Text>
                <Text>
                    {machine?.infus_rate_recommendation || "0"} tetes per menit
                </Text>
                <Text mt={1} fontWeight="bold">
                    Faktor Infus:
                </Text>
                <Select
                    mt={1}
                    size="sm"
                    value={machine?.infus_factor || "macro"}
                    onChange={(e) => {
                        if (machine) {
                            machine.infus_factor = e.target.value;
                            saveMachine();
                        }
                    }}
                >
                    <option value="macro">Makro</option>
                    <option value="micro">Mikro</option>
                    <option value="transfusion">Transfusi</option>
                </Select>
            </Flex>
            <GridItem colSpan={3} gridRow={3}>
                <Flex
                    flexDirection="column"
                    borderRadius="md"
                    background="white"
                    h="100%"
                    justifyContent="center"
                    w="100%"
                    p={8}
                    boxShadow="sm"
                >
                    <Line options={chartOptions} data={chartData} />
                </Flex>
            </GridItem>
            <GridItem gridColumn={4} gridRow={3}>
                <Flex
                    flexDirection="column"
                    borderRadius="md"
                    background="white"
                    h="auto"
                    justifyContent="center"
                    w="100%"
                    py={6}
                    p={4}
                    boxShadow="sm"
                >
                    <Text fontSize="xl" fontWeight="bold">
                        Informasi Pasien
                    </Text>
                    <Select
                        mt={1}
                        placeholder="Pilih pasien"
                        size="sm"
                        value={patientIndex}
                        onChange={(e) => {
                            setPatientIndex(parseInt(e.target.value));
                        }}
                    >
                        {patients.map((patient: Patient, i) => (
                            <option key={i} value={i}>
                                {patient.name}
                            </option>
                        ))}
                    </Select>
                    {patient && (
                        <>
                            <Text mt={1} fontWeight="bold">
                                Umur:
                            </Text>
                            <Text>{patient.age} tahun</Text>
                            <Text mt={1} fontWeight="bold">
                                Jenis Kelamin:
                            </Text>
                            <Text>
                                {patient.gender == "male"
                                    ? "Laki-laki"
                                    : "Perempuan"}
                            </Text>
                            <Text mt={1} fontWeight="bold">
                                Berat Badan:
                            </Text>
                            <Text>{patient.weight} kg</Text>
                            <Text mt={1} fontWeight="bold">
                                Detak Jantung:
                            </Text>
                            <Text>{patient.bpm} bpm</Text>
                            <Text mt={1} fontWeight="bold">
                                Saturasi Oksigen:
                            </Text>
                            <Text>{patient.spO2} %</Text>
                            {patient.id == machine.patient ? (
                                <Button
                                    mt={2}
                                    onClick={() => {
                                        props.setOverlayPage(
                                            PatientUpdateFormPage,
                                            {
                                                title: "Update Kondisi Pasien",
                                                data: patient,
                                            }
                                        );
                                    }}
                                    colorScheme="blue"
                                >
                                    Update Kondisi
                                </Button>
                            ) : (
                                <Button
                                    mt={2}
                                    onClick={() => {
                                        machine.patient = patient.id;
                                        saveMachine();
                                    }}
                                    colorScheme="green"
                                >
                                    Tetapkan Pasien
                                </Button>
                            )}
                        </>
                    )}
                </Flex>
            </GridItem>
        </Grid>
    ) : loading ? (
        <CircularProgress
            alignSelf="center"
            alignContent="center"
            h="100%"
            isIndeterminate
            ringColor="blue"
        />
    ) : (
        <Text alignSelf="center" alignContent="center" h="100%">
            Tidak ada mesin.
        </Text>
    );
}

interface CardProps {
    title: string | JSX.Element;
    subtitle: string | JSX.Element;
    cardColor?: string;
    icon: IconType;
}

function DashboardCard({ title, subtitle, cardColor, icon }: CardProps) {
    return (
        <Box
            p={4}
            bg="white"
            borderRadius="md"
            w="100%"
            py={6}
            display="flex"
            alignItems="center"
            borderLeft={cardColor && `4px solid`}
            borderColor={cardColor}
            boxShadow="sm"
        >
            <Box flex="1">
                {typeof title === "string" ? (
                    <Text fontWeight="bold" fontSize="xl">
                        {title}
                    </Text>
                ) : (
                    title
                )}
                {typeof subtitle === "string" ? (
                    <Text fontSize="md">{subtitle}</Text>
                ) : (
                    subtitle
                )}
            </Box>
            <Icon as={icon} w={12} h={12} pl={4} />
        </Box>
    );
}

export function PatientUpdateFormPage(props: AppPageProps) {
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);

    const formSchema = Yup.object().shape({
        name: Yup.string().required("Required field"),
        age: Yup.number().min(1).required("Required field"),
        gender: Yup.string()
            .oneOf(["male", "famale"], "Invalid gender")
            .required("Required field"),
        weight: Yup.number().required("Required field").min(1),
        bpm: Yup.number().required("Required field"),
        spO2: Yup.number().required("Required field").min(0).max(100),
    });

    const onSubmit = (values: any) => {
        setButtonLoading(true);
        api.patch("/patient/" + props.data?.id, values)
            .then((res) => {
                const result = res.data;
                if (result.code >= 200 && result.code <= 300) {
                    props.showToast({
                        title: result.message,
                        status: "success",
                    });
                    props.destroy();
                } else
                    props.showToast({
                        title: result.message,
                        status: "error",
                    });
            })
            .catch((err) => {
                props.showToast({
                    title: "Gagal menyimpan data, silahkan cobalagi!",
                    status: "error",
                });
            })
            .finally(() => {
                setButtonLoading(false);
            });
    };
    return (
        <Card>
            <CardBody>
                <Formik
                    initialValues={props.data || null}
                    validationSchema={formSchema}
                    onSubmit={onSubmit}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <FormControl
                                isInvalid={errors.name && touched.name}
                            >
                                <FormLabel htmlFor="name">Nama</FormLabel>
                                <Field
                                    as={Input}
                                    id="name"
                                    name="name"
                                    placeholder="Ex: Osamu Dazai"
                                />
                                <FormErrorMessage>
                                    {errors.name}
                                </FormErrorMessage>
                            </FormControl>

                            <FormControl
                                isInvalid={errors.age && touched.age}
                                mt={4}
                            >
                                <FormLabel htmlFor="age">Umur</FormLabel>
                                <Field
                                    as={Input}
                                    id="age"
                                    name="age"
                                    type="number"
                                    placeholder="Ex: 27"
                                />
                                <FormErrorMessage>
                                    {errors.age}
                                </FormErrorMessage>
                            </FormControl>

                            <FormControl
                                isInvalid={errors.gender && touched.gender}
                                mt={4}
                            >
                                <FormLabel htmlFor="gender">
                                    Jenis Kelamin
                                </FormLabel>
                                <Field as={Select} id="gender" name="gender">
                                    <option value="">Pilih</option>
                                    <option value="male">Laki-laki</option>
                                    <option value="famale">Perempuan</option>
                                </Field>
                                <FormErrorMessage>
                                    {errors.gender}
                                </FormErrorMessage>
                            </FormControl>

                            <FormControl
                                isInvalid={errors.weight && touched.weight}
                                mt={4}
                            >
                                <FormLabel htmlFor="weight">
                                    Berat Badan (kg)
                                </FormLabel>
                                <Field
                                    as={Input}
                                    id="weight"
                                    name="weight"
                                    type="number"
                                    placeholder="Berat Badan (kg)"
                                />
                                <FormErrorMessage>
                                    {errors.weight}
                                </FormErrorMessage>
                            </FormControl>

                            <FormControl
                                isInvalid={errors.bpm && touched.bpm}
                                mt={4}
                            >
                                <FormLabel htmlFor="bpm">
                                    Detak Jantung (bpm)
                                </FormLabel>
                                <Field
                                    as={Input}
                                    id="bpm"
                                    name="bpm"
                                    type="number"
                                    placeholder="Detak Jantung (bpm)"
                                />
                                <FormErrorMessage>
                                    {errors.bpm}
                                </FormErrorMessage>
                            </FormControl>

                            <FormControl
                                isInvalid={errors.spO2 && touched.spO2}
                                mt={4}
                            >
                                <FormLabel htmlFor="spO2">
                                    Saturasi Oksigen SpO2 (%)
                                </FormLabel>
                                <Field
                                    as={Input}
                                    id="spO2"
                                    name="spO2"
                                    type="number"
                                    placeholder="Saturasi Oksigen SpO2 (%)"
                                />
                                <FormErrorMessage>
                                    {errors.spO2}
                                </FormErrorMessage>
                            </FormControl>

                            <Flex gap={2} justify="flex-end" mt={4}>
                                <Button
                                    isLoading={buttonLoading}
                                    colorScheme="blue"
                                    type="submit"
                                >
                                    Simpan
                                </Button>
                            </Flex>
                        </Form>
                    )}
                </Formik>
            </CardBody>
        </Card>
    );
}

export default MonitoringPage;
