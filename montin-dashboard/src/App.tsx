import { useState } from 'react'
import { Popover, PopoverBody, PopoverContent, PopoverTrigger, Icon, Flex, Avatar, Box } from '@chakra-ui/react'
import { FaHouse, FaAccessibleIcon, FaDoorClosed } from 'react-icons/fa6'
import MainContent from "./layouts/MainContent.js";
import PatientContent from "./layouts/PatientContent.js";
import './App.css'

const activeMenuStart = 0;
const menuItems = [
    {
        icon: FaHouse,
        title: "Halaman Utama",
        content: MainContent
    },
    {
        icon: FaAccessibleIcon,
        title: "Daftar Pasien",
        content: PatientContent
    },
];

function App() {
  const [page, setPage] = useState(menuItems[activeMenuStart]);

  return (
      <>
          <Flex h="100%">
              <Sidebar onItemChanged={(menu: any) => setPage(menu)} />
              <Box w="100%">

                  <Flex direction="column" px="2rem" py="1.3rem">
                      <h1
                          style={{
                              marginBottom: "0.3rem",
                              fontSize: "1.5rem",
                              fontWeight: "bold",
                          }}
                      >
                          {page.title}
                      </h1>
                      {<page.content />}
                  </Flex>
              </Box>
          </Flex>
      </>
  );
}

function Sidebar(props: any){
  const { onItemChanged } = props;
  const [menuActive, setMenuActive] = useState(activeMenuStart);
  

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
                  <NavItem
                      key={i}
                      icon={menu.icon}
                      onClick={() => {
                        setMenuActive(i)
                        if (onItemChanged) onItemChanged(menu)
                      }}
                      active={menuActive == i}
                  >
                      {menu.title}
                  </NavItem>
              ))}
          </Flex>
      </Box>
  );
}

const NavItem = (props: any) => {

    const { icon, children, active } = props;
    return (
        <Flex
            align="center"
            px="4"
            py="3"
            cursor="pointer"
            role="group"
            fontWeight="semibold"
            transition=".15s ease"
            color={active ? "gray.900" : "gray.400"}
            bg={active ? "gray.100" : "transparent"}
            _hover={
                active || {
                    color: "gray.100",
                }
            }
            {...props}
        >
            {icon && <Icon mx="2" boxSize="4" as={icon} />}
            {children}
        </Flex>
    );
};

export default App
