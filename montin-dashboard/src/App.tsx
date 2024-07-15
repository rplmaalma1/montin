import { useState } from 'react'
import { Icon, Flex, Box } from '@chakra-ui/react'
import { FaTv, FaAccessibleIcon } from 'react-icons/fa6'
import MainContent from "./layouts/MonitoringContent.tsx";
import PatientContent from "./layouts/PatientContent.js";
import { io } from 'socket.io-client';
import './App.css'

const client = io("http://192.168.1.121");

const menuItems = [
    {
        icon: FaTv,
        title: "Monitoring Mesin",
        content: MainContent
    },
    {
        icon: FaAccessibleIcon,
        title: "Daftar Pasien",
        content: PatientContent
    },
];

function App() {
  const [menuActive, setMenuActive] = useState(0);
  const menu = menuItems[menuActive]
  return (
      <>
          <Flex h="100%">
              <Sidebar active={menuActive} onItemChanged={(index:number) => setMenuActive(index)} />
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
                      {<menu.content data={[
    {
        "id": 1,
        "name": "Wahyu Romdhoni",
        "gender": "l",
        "age": 16,
        "weight": 45,
        "heart_beat": 190,
        "sp02": 90
    },
    {
        "id": 2,
        "name": "Siti Aisyah",
        "gender": "p",
        "age": 17,
        "weight": 50,
        "heart_beat": 85,
        "sp02": 95
    },
    {
        "id": 3,
        "name": "Andi Prasetyo",
        "gender": "l",
        "age": 18,
        "weight": 60,
        "heart_beat": 80,
        "sp02": 97
    },
    {
        "id": 4,
        "name": "Rina Julianti",
        "gender": "p",
        "age": 15,
        "weight": 40,
        "heart_beat": 200,
        "sp02": 92
    },
    {
        "id": 5,
        "name": "Budi Santoso",
        "gender": "l",
        "age": 19,
        "weight": 70,
        "heart_beat": 75,
        "sp02": 98
    }
]
}/>}
                  </Flex>
              </Box>
          </Flex>
      </>
  );
}

function Sidebar(props: any){
  const { onItemChanged, active } = props;
  

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
          <Flex
              direction="column"
              as="nav"
              fontSize="md"
              color="gray.600"
          >
              {menuItems.map((menu, i) => (
                <Flex
                onClick={() => {
                    if (onItemChanged) onItemChanged(i)
                  }}
                align="center"
                px="4"
                py="3"
                cursor="pointer"
                role="group"
                fontWeight="semibold"
                transition=".15s ease"
                color={active==i ? "gray.900" : "gray.400"}
                bg={active==i ? "gray.100" : "transparent"}
                _hover={
                    active==i || {
                        color: "gray.100",
                        bg: "gray.900"
                    }
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

export default App
