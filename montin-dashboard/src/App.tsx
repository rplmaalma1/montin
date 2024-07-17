import { useEffect, useState } from "react";
import { Icon, Flex, Box } from "@chakra-ui/react";
import { FaTv, FaAccessibleIcon } from "react-icons/fa6";
import MainContent from "./layouts/MonitoringContent.tsx";
import PatientContent, { Patient } from "./layouts/PatientContent.js";
import "./App.css";
import { IconType } from "react-icons";

interface Menu {
  icon: IconType;
  title: string;
  content: JSX.Element;
}

export interface ResponseData{
    data: any;
    message: string;
    code: number;
  }  

function App() {
  const [menuActive, setMenuActive] = useState(0);
  const [patientData, setPatientData] = useState<Patient[]>();
  const menuItems: Menu[] = [
    {
      icon: FaTv,
      title: "Monitoring Mesin",
      content: <MainContent />,
    },
    {
      icon: FaAccessibleIcon,
      title: "Daftar Pasien",
      content: <PatientContent data={patientData} />,
    },
  ];
  const menu = menuItems[menuActive];

  return (
    <>
      <Flex h="100%">
        <Sidebar
          items={menuItems}
          active={menuActive}
          onItemChanged={(index: number) => setMenuActive(index)}
        />
        <Box w="100%">
          <Flex direction="column" px="2rem" py="1.3rem">
            <h1
              style={{
                marginBottom: "0.5rem",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              {menu.title}
            </h1>
            {menu.content}
          </Flex>
        </Box>
      </Flex>
    </>
  );
}

function Sidebar(props: any) {
  const { onItemChanged, active, items } = props;

  return (
    <Box as="nav" w="325px" bg="gray.800" color="white" boxShadow="lg">
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: "bold",
          textAlign: "center",
          marginBlock: "1.2rem",
        }}
      >
        MonIn Dashboard
      </h3>
      <Flex direction="column" as="nav" fontSize="md" color="gray.600">
        {items.map((menu: Menu, i: number) => (
          <Flex
            key={i}
            onClick={() => {
              if (onItemChanged) onItemChanged(i);
            }}
            align="center"
            px="4"
            py="3"
            cursor="pointer"
            role="group"
            fontWeight="semibold"
            transition=".15s ease"
            color={active == i ? "gray.900" : "gray.400"}
            bg={active == i ? "gray.100" : "transparent"}
            _hover={
              active != i
                ? {
                    color: "gray.100",
                    bg: "gray.900",
                  }
                : undefined
            }
          >
            {<Icon mx="2" boxSize="4" as={menu.icon} />}
            {menu.title}
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}

export default App;
