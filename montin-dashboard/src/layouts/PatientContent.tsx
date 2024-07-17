import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CircularProgress,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Table,
  Tbody,
  Td,
  Thead,
  Th,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FaPlus, FaMagnifyingGlass, FaEllipsisVertical, FaInfo, FaPencil, FaTrash } from 'react-icons/fa6';
import { ResponseData } from "../App.tsx";


export interface Patient {
  id: number;
  name: string;
  gender: string;
  age: number;
  weight: number;
  bpm: number;
  spo2: number;
}

interface PatientContentProps {
  data: Patient[] | undefined;
}

function PatientContent({ data }: PatientContentProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [tableData, setTableData] = useState<Patient[] | undefined>(data);
  const [loading, setLoading] = useState<boolean>(!tableData);
  const [error, setError] = useState<string>();
  const [loadingButton, setLoadingButton] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    bpm: '',
    spo2: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_SERVER_URL + "patient");
        if (!response.ok) throw new Error();
        const result: ResponseData = await response.json();
        if (result.code >= 200 && result.code <= 300) setTableData(result.data);
        else setError(result.message);
      } catch (err) {
        setError("Gagal mengambil data, coba lagi!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: { target: any; }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { name, age, gender, weight, bpm, spo2 } = formData;
    
    if (!name || !age || !gender) {
      alert('Please fill in all required fields');
      return;
    }

    setLoadingButton(true);

    try {
      const response = await fetch(import.meta.env.VITE_SERVER_URL + "patient", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          age: parseInt(age, 10),
          gender,
          weight: weight ? parseInt(weight, 10) : undefined,
          bpm: bpm ? parseFloat(bpm) : undefined,
          spo2: spo2 ? parseFloat(spo2) : undefined,
        }),
      });
      if (!response.ok) throw new Error();
      const result = await response.json();
      if (result.code >= 200 && result.code <= 300){
        if (tableData) setTableData([...tableData, result.data]);
          else setTableData([result.data]);
          toast({
            title: "Pasien ditambahkan.",
            description: "Pasien berhasil ditambahkan ke daftar.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          onClose();
          setFormData({ name: '', age: '', gender: '', weight: '', bpm: '', spo2: '' }); // Reset form
      }
      else {
        toast({
          title: "Pasien gagal ditambahkan",
          description: result.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error.",
        description: "Gagal menambahkan pasien, coba lagi!",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingButton(false);
    }
  };

  return (
    <>
      <Card>
        {!error && (
          <CardHeader as={Flex} justifyContent="space-between">
            <Button onClick={onOpen} leftIcon={<FaPlus />} colorScheme="green">
              Tambah Pasien
            </Button>
            <InputGroup w="max-content">
              <InputLeftAddon bgColor="blue.400" color="white">
                <FaMagnifyingGlass />
              </InputLeftAddon>
              <Input type="tel" placeholder="Cari disini..." />
            </InputGroup>
          </CardHeader>
        )}
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Nama Pasien</Th>
                <Th>Jenis Kelamin</Th>
                <Th isNumeric>Usia</Th>
                <Th textAlign="center">Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tableData && tableData.length !== 0 && !error ? (
                tableData.map((patient) => (
                  <Tr key={patient.id}>
                    <Td>{patient.id}</Td>
                    <Td>{patient.name}</Td>
                    <Td>{patient.gender === "male" ? "Laki-laki" : "Perempuan"}</Td>
                    <Td isNumeric>{patient.age} tahun</Td>
                    <Td textAlign="center">
                      <Menu>
                        <MenuButton aria-label="More options">
                          <FaEllipsisVertical />
                        </MenuButton>
                        <MenuList>
                          <MenuItem icon={<FaInfo />} onClick={() => console.log("Detail", patient.id)}>
                            Detail
                          </MenuItem>
                          <MenuItem icon={<FaPencil />} onClick={() => console.log("Edit", patient.id)}>
                            Edit
                          </MenuItem>
                          <MenuItem icon={<FaTrash />} color="red.600" onClick={() => console.log("Delete", patient.id)}>
                            Hapus
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={6} textAlign="center" py="3rem">
                    {loading ? (
                      <CircularProgress isIndeterminate ringColor="blue" />
                    ) : error ? (
                      "Gagal mengambil data, silahakan coba lagi"
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

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tambahkan Pasien</ModalHeader>
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel>Nama</FormLabel>
              <Input
                name="name"
                placeholder="Nama"
                value={formData.name}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel>Umur</FormLabel>
              <NumberInput min={1}>
                <NumberInputField
                  name="age"
                  placeholder="Umur"
                  value={formData.age}
                  onChange={(e) => handleChange({ target: { name: 'age', value: e.target.value } })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel>Gender</FormLabel>
              <Select
                name="gender"
                placeholder="Jenis Kelamin"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </Select>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Weight (kg)</FormLabel>
              <NumberInput min={0}>
                <NumberInputField
                  name="weight"
                  placeholder="Berat Badan"
                  value={formData.weight}
                  onChange={(e) => handleChange({ target: { name: 'weight', value: e.target.value } })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>BPM</FormLabel>
              <NumberInput min={0} step={0.1}>
                <NumberInputField
                  name="bpm"
                  placeholder="BPM"
                  value={formData.bpm}
                  onChange={(e) => handleChange({ target: { name: 'bpm', value: e.target.value } })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>SpO2 (%)</FormLabel>
              <NumberInput min={0}>
                <NumberInputField
                  name="spo2"
                  placeholder="SpO2 (%)"
                  value={formData.spo2}
                  onChange={(e) => handleChange({ target: { name: 'spo2', value: e.target.value } })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSubmit}
              isLoading={loadingButton}
              loadingText="Menyimpan..."
            >
              Simpan
            </Button>
            <Button onClick={onClose}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default PatientContent;
