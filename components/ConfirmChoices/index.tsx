import { useState } from "react";
import LoadingSpinner from "../LoadingSpinner";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios, { AxiosError } from "axios";
// import { loggedInUser } from "@/AppConstants";
import { BASE_URL } from "@/AppConstants";
// import { useSelector } from "react-redux";
import PreferenceCard from "../Cards/ChoicesCard";

interface ConfirmPreferencesProps {
    loading: boolean;
    setLoading: any;
    selectedCourses: any[];
}

export default function ConfirmPreferences({
    loading,
    setLoading,
    selectedCourses
}: ConfirmPreferencesProps) {

    const [isConfirmed, setIsConfirmed] = useState(false);

    const confirmNotify = () => toast("Preferences Confirmed!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

    const declineNotify = (msg: string) => toast.error(msg, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

    const userId = localStorage.getItem("userId");

    const handleConfirm = async () => {
        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        try{
            const response = await axios.patch(`${BASE_URL}/students/student/${userId}/choices`, {
                choices: selectedCourses.map(course => course._id),
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
            console.log("Response: ", response);
            if(response.status === 200 && response.data){
                setLoading(false);
                setTimeout(() => {
                    confirmNotify();
                }, 300);
                setIsConfirmed(true);
            }else{
                console.log("Failed to confirm preferences");
                alert("Failed to confirm preferences");
                setLoading(false);
                setTimeout(() => {
                    declineNotify("Failed to confirm Preferences!");
                }, 300);

                setIsConfirmed(false);
            }
        }
        catch(error: any){
            console.log(error);
            setLoading(false);
            setTimeout(() => {
                declineNotify(error.response.data.message);
            }, 300);

            setIsConfirmed(false);
        }
    }


    return (
        <>
            <div className="min-h-full h-96 w-10/12 lg:w-1/3 xl:w-1/3 md:w-1/3 xl:w-1/3 2xl:w-1/3 dark:bg-[#1F2937] bg-[#A4B8FF] flex flex-col">
                <div className="flex-grow overflow-y-auto">
                    <div className="flex flex-col gap-4 my-5">
                        {
                            selectedCourses.map((course, index) => (
                                <PreferenceCard index = {index} key={index} course={course} />
                            ))
                        }
                    </div>
                </div>
                <div className="w-full">
                    <button 
                    disabled={isConfirmed}
                    className="bg-[#4E7396] w-full py-3 justify-center items-center flex text-white font-bold" onClick={handleConfirm}>
                        {
                            loading ? <LoadingSpinner /> : isConfirmed ? "Confirmed" : "Confirm Preferences"
                        }
                    </button>
                </div>
            </div>
            <ToastContainer />
        </>
    )
}
