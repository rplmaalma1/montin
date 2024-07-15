import {
  Card,
  CardBody,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Button,
  CardHeader,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  InputGroup,
  InputLeftAddon,
  Input,
  Flex
} from "@chakra-ui/react";
import { FaEllipsisVertical, FaInfo, FaTrash, FaPencil, FaPlus, FaMagnifyingGlass
 } from "react-icons/fa6"; // Ensure you import the correct icon

interface Patient {
  id: number;
  name: string;
  gender: string;
  age: number;
  weight: number;
}

interface PatientContentProps {
  data: Patient[];
}

function PatientContent({ data }: PatientContentProps) {

  return (
    <Card>
      <CardHeader as={Flex} justifyContent="space-between">
        <Button leftIcon={<FaPlus/>} colorScheme="green">Tambah Pasien</Button>
        <InputGroup w="max-content">
    <InputLeftAddon bgColor="blue.400" color="white"><FaMagnifyingGlass/></InputLeftAddon>
    <Input type='tel' placeholder='Cari disini...' />
  </InputGroup>
      </CardHeader>
      <CardBody>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Nama Pasien</Th>
              <Th>Jenis Kelamin</Th>
              <Th isNumeric>Usia</Th>
              <Th isNumeric>Berat Badan (kg)</Th>
              <Th textAlign="center">Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((patient) => (
              <Tr key={patient.id}>
                <Td>{patient.id}</Td>
                <Td>{patient.name}</Td>
                <Td>{patient.gender === 'l' ? 'Laki-laki' : 'Perempuan'}</Td>
                <Td isNumeric>{patient.age} tahun</Td>
                <Td isNumeric>{patient.weight} kg</Td>
                <Td textAlign="center">
                <Menu>
                    <MenuButton aria-label="More options">
                      <FaEllipsisVertical/>
                    </MenuButton>
                    <MenuList>
                      <MenuItem icon={<FaInfo/>} onClick={() => console.log('Detail', patient.id)}>Detail</MenuItem>
                      <MenuItem icon={<FaPencil/>} onClick={() => console.log('Edit', patient.id)}>Edit</MenuItem>
                      <MenuItem icon={<FaTrash/>} color="red.600" onClick={() => console.log('Delete', patient.id)}>Hapus</MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
}

export default PatientContent;
