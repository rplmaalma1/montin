import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CircularProgress,
    Flex,
    Input,
    InputGroup,
    InputLeftAddon,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Table,
    Tbody,
    Td,
    Thead,
    Th,
    Tr,
    FormControl,
    FormLabel,
    Select,
    FormErrorMessage,
    Link,
} from "@chakra-ui/react";
import {
    FaPlus,
    FaMagnifyingGlass,
    FaEllipsisVertical,
    FaInfo,
    FaPencil,
    FaTrash,
} from "react-icons/fa6";
import { api, AppPageProps, socket_client } from "../App.js";
import { Formik, Form, Field } from "formik";

export interface Patient {
    id: string;
    name: string;
    gender: string;
    age: number;
    weight: number;
    bpm: number;
    spO2: number;
}

function PatientPage(props: AppPageProps) {
    const realData = useRef(props.data);
    const [tableData, setTableData] = useState<Patient[] | undefined>(
        props.data
    );
    const [loading, setLoading] = useState<boolean>(!tableData);
    const renderCount = useRef(-1);

    useEffect(() => {
        if (renderCount.current == 0) {
            api.get("/patients")
                .then((res) => {
                    const result = res.data;
                    if (result.code >= 200 && result.code <= 300) {
                        realData.current = result.data;
                        setTableData(result.data);
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
            renderCount.current++;
        };
    }, []);

    const searchData = (query: any) => {
        if (query.length === 0) {
            setTableData(realData.current);
            return;
        }
        const newData = realData.current.filter((patient: Patient) => {
            return patient.name.toLowerCase().includes(query.toLowerCase());
        });
        setTableData(newData);
    };

    return (
        <>
            <Card>
                {!loading && (
                    <CardHeader as={Flex} justifyContent="space-between">
                        <Button
                            leftIcon={<FaPlus />}
                            colorScheme="green"
                            onClick={() => {
                                props.setOverlayPage(PatientAddFormPage, {
                                    title: "Tambahkan Pasien",
                                });
                            }}
                        >
                            Tambah Pasien
                        </Button>
                        <InputGroup w="max-content">
                            <InputLeftAddon bgColor="blue.400" color="white">
                                <FaMagnifyingGlass />
                            </InputLeftAddon>
                            <Input
                                type="tel"
                                onChange={(e: any) =>
                                    searchData(e.target.value)
                                }
                                placeholder="Cari nama disini..."
                            />
                        </InputGroup>
                    </CardHeader>
                )}
                <CardBody>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>No</Th>
                                <Th>Nama Pasien</Th>
                                <Th>Jenis Kelamin</Th>
                                <Th isNumeric>Usia</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            { !loading && tableData && tableData.length !== 0 ? (
                                tableData.map((patient, i) => (
                                    <Tr key={patient.id}>
                                        <Td>{i + 1}</Td>
                                        <Td>
                                            <Link
                                                onClick={() => {
                                                    props.setOverlayPage(
                                                        PatientEditFormPage,
                                                        {
                                                            title: "Edit Pasien",
                                                            data: patient,
                                                        }
                                                    );
                                                }}
                                            >
                                                {patient.name}
                                            </Link>
                                        </Td>
                                        <Td>
                                            {patient.gender === "male"
                                                ? "Laki-laki"
                                                : "Perempuan"}
                                        </Td>
                                        <Td isNumeric>{patient.age} tahun</Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td
                                        colSpan={6}
                                        textAlign="center"
                                        py="3rem"
                                    >
                                        {loading ? (
                                            <CircularProgress
                                                isIndeterminate
                                                ringColor="blue"
                                            />
                                        ) : (
                                            "Tidak ada data."
                                        )}
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>
                </CardBody>
            </Card>
        </>
    );
}

export function PatientAddFormPage(props: AppPageProps) {
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
        api.post("/patient", values)
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
                    title: "Gagal menambahkan data, silahkan cobalagi!",
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
                    initialValues={{
                        name: "",
                        age: "",
                        gender: "",
                        weight: "",
                        bpm: "",
                        spO2: "",
                    }}
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

                            <FormControl mt={4}>
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
                                    colorScheme="green"
                                    type="submit"
                                >
                                    Tambah
                                </Button>
                            </Flex>
                        </Form>
                    )}
                </Formik>
            </CardBody>
        </Card>
    );
}

export function PatientEditFormPage(props: AppPageProps) {
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
                                <Field
                                    as={Select}
                                    id="gender"
                                    name="gender"
                                >
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
                                    colorScheme="red"
                                    onClick={() => {
                                        setButtonLoading(true);
                                        api.delete(
                                            `/patient/${props.data?.id}`
                                        )
                                            .then((res) => {
                                                const result = res.data;
                                                if (
                                                    result.code >= 200 &&
                                                    result.code <= 300
                                                ) {
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
                                                    title: "Gagal menghapus data, silahkan cobalagi!",
                                                    status: "error",
                                                });
                                            })
                                            .finally(() => {
                                                setButtonLoading(false);
                                            });
                                    }}
                                >
                                    Hapus
                                </Button>
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

export default PatientPage;
