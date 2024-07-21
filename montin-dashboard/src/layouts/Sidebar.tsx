import { Flex, Icon, Box } from "@chakra-ui/react";
import { AppMenu } from "../App.js";

function Sidebar(props: any) {
    const { onItemChanged, active, items } = props;

    return (
        <Box as="nav" w="250px" bg="gray.800" color="white" boxShadow="lg">
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
                {items.map((menu: AppMenu, i: number) => (
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

export default Sidebar;
