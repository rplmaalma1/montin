import { useState, useRef, useReducer, useEffect } from "react";
import { Flex, Box, useToast, UseToastOptions, Link, Icon } from "@chakra-ui/react";
import { FaTv, FaAccessibleIcon, FaArrowLeft } from "react-icons/fa6";
import MonitoringPage from "./layouts/MonitoringPage.js";
import PatientPage from "./layouts/PatientPage.js";
import "./App.css";
import { IconType } from "react-icons/lib";
import Sidebar from "./layouts/Sidebar.js";
import axios from "axios";
import { io } from "socket.io-client";

export const socket_client = io(import.meta.env.VITE_SERVER_URL);

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + "api"
})

export interface AppMenu {
    icon: IconType;
    title: string;
    page: (props: AppPageProps) => JSX.Element;
    overlayPage?: (props: AppPageProps) => JSX.Element;
}

export interface ResponseData {
    data: any;
    message: string;
    code: number;
}


export interface AppPageProps {
    setTitle: (value: string) => void;
    setData: (value: any) => void;
    setOverlayPage: (page: (props: AppPageProps) => JSX.Element, data?: any) => void;
    showToast: (options: UseToastOptions) => void;
    destroy: () => void;
    data?: any;
}

function App() {
    const [activeMenu, setActiveMenu] = useState(0);
    const toast = useToast();
    const [data, setData] = useState();
    const [overlayOverlayPageTitle, setOverlayPageTitle] = useState("");
    const [overlayPageData, setOverlayPageData] = useState();
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    
    const menuItems = useRef<AppMenu[]>([
        {
            icon: FaTv,
            title: "Monitoring Mesin",
            page: MonitoringPage,
        },
        {
            icon: FaAccessibleIcon,
            title: "Daftar Pasien",
            page: PatientPage,
        }
    ]);
    const menu = menuItems.current[activeMenu];

    const overlayPageProps = {
      setTitle: (title: string) => {
        setOverlayPageTitle(title);
        forceUpdate();
      },
      setData: (data: any) => {
        setOverlayPageData(data);
        forceUpdate();
      },
      setOverlayPage: (page: (props: AppPageProps) => JSX.Element, opt?: {title?:string, data?:any}) => {
        menu.overlayPage = page;
        if (opt){
          if (opt.title) setOverlayPageTitle(opt?.title);
          if (opt.data) setOverlayPageData(opt?.data);
        }
        forceUpdate();
      },
      destroy: () => {
        menu.overlayPage = undefined;
        forceUpdate();
      }
    }

    return (
        <>
            <Flex overflow="hidden" h="100%">
                <Sidebar
                    items={menuItems.current}
                    active={activeMenu}
                    onItemChanged={(index: number) => {
                        menu.overlayPage = undefined;
                        setData(undefined);
                        setActiveMenu(index);
                    }}
                />
                <Box w="100%" overflow="auto">
                    <Flex direction="column" px="2rem" py="1.3rem" h="100%">
                        {menu.overlayPage && (
                            <Link onClick={() => overlayPageProps.destroy()}>
                                <Icon as={FaArrowLeft} /> Kembali
                            </Link>
                        )}
                        <h1
                            style={{
                                marginBottom: "0.5rem",
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                            }}
                        >
                            {menu.overlayPage
                                ? overlayOverlayPageTitle
                                : menu.title}
                        </h1>
                        {menu.overlayPage ? (
                            <menu.overlayPage
                                setTitle={overlayPageProps.setTitle}
                                setData={overlayPageProps.setData}
                                setOverlayPage={overlayPageProps.setOverlayPage}
                                destroy={overlayPageProps.destroy}
                                showToast={toast}
                                data={overlayPageData}
                            />
                        ) : (
                            <menu.page
                                setTitle={(title: string) => {
                                  menu.title = title;
                                  forceUpdate();
                                }}
                                setData={setData}
                                setOverlayPage={overlayPageProps.setOverlayPage}
                                showToast={toast}
                                destroy={()=>console.error("U do't need destroy this page!")}
                                data={data}
                            />
                        )}
                    </Flex>
                </Box>
            </Flex>
        </>
    );
}

export default App;
