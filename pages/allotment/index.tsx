import { loggedInUser } from "@/AppConstants";
import CoursesCard from "@/components/Cards/CoursesCard";
import ConfirmAllotment from "@/components/ConfirmAllotment";
import DetailsCard from "@/components/DetailsCard";
import DragAndDrop from "@/components/DragAndDrop";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import Navbar from "@/components/Navbar";
import Stepper from "@/components/Stepper";
import axios, { all } from "axios";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { BASE_URL } from "@/AppConstants";
import { time } from "console";

export default function Allotment() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [verified, setVerified] = useState(false);
  const [choiceStatus, setChoiceStatus] = useState("notFilled");

  const userId = useSelector((state: any) => state.auth.userId);
  console.log(userId);

  const informNotify = () =>
    toast.info("Please select atleast one course!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  const [studentData, setStudentData] = useState({
    name: "loading",
    regNo: "loading",
    faName: "loading",
    email: "loading",
    programName: "loading",
    semester: "loading",
    cgpa: "loading",
    sgpaS1: "loading",
    sgpaS2: "loading",
  });

  const [allCourses, setAllCourses] = useState([
    // {
    //     id: "",
    //     name: 'Minor 1',
    //     code: 'CS0019',
    //     credits: 4,
    //     department: 'CSE'
    // },
  ]);

  const [isUserChosenAllotment, setIsUserChosenAllotment] = useState(false);
  const [userAlloted, setUserAlloted] = useState({
    isAlloted: false,
    result: "",
  });

  const fetchUserData = async () => {
    setLoading(true);
    try {
      console.log("logged in user: ", userId);
      const response = await axios.get(`/api/fetchUserData?id=${userId}`);
      const data = response.data;
      if (data.choices.length > 0) {
        setIsUserChosenAllotment(true);
      } else {
        setIsUserChosenAllotment(false);
      }
      console.log(data.enrolled);
      if (data.enrolled != "none") {
        setUserAlloted({
          isAlloted: true,
          result: data.enrolled,
        });
      } else {
        setUserAlloted({
          isAlloted: false,
          result: "none",
        });
      }
      setStudentData(data);
      setVerified(data.isVerified);
      setChoiceStatus(data.choices.length > 0 ? "filled" : "notFilled");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/fetchCoursesData");
      const data = response.data;
      console.log(data);
      setAllCourses(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const [timeline, setTimeline] = React.useState("loading");

  type TimelineData = {
    stage: string; // Adjust the type according to your actual data structure
  };

  React.useEffect(() => {
    const getTimeline = async () => {
      console.log("function running");
      try {
        const response = await fetch(`${BASE_URL}/students/timeline`);
        const data: TimelineData = await response.json();
        console.log("stage is ", data.stage);
        setTimeline(data.stage);

        switch (timeline) {
          case "verification":
            setActiveStep(1);
            break;
          case "choiceFilling":
            setActiveStep(2);
            break;
          case "allotment":
            setActiveStep(3);
            break;
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCoursesData();
    fetchUserData();
    getTimeline();
  }, []);

  const [allotedCourse, setAllotedCourse] = useState({
    name: "",
    code: "",
    department: "",
    faculty: "",
    facultyEmail: "",
    credit: 0,
    description: "",
    schedule: "",
  });

  const fetchAllotedCourse = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/minors/minor/${userAlloted.result}`
      );
      const data = response.data;
      console.log(data);
      setAllotedCourse(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  React.useEffect(() => {
    if (userAlloted.isAlloted) {
      fetchAllotedCourse();
    }
  }, [userAlloted]);

  const [selectedCourses, setSelectedCourses] = useState([]);

  console.log(selectedCourses);

  const handleNext = () => {
    if (selectedCourses.length === 0) {
      informNotify();
    } else {
      // setActiveStep(activeStep + 1);
      // setStep(step + 1);
      setChoiceStatus("filled");
    }
  };

  const renderComponent = () => {
    switch (timeline) {
      case "verification":
        if (studentData === null) return <LoadingSpinner />;
        return (
          <DetailsCard
            handleConfirm={handleConfirm}
            studentData={studentData}
            verified={verified}
          />
        );

      case "choiceFilling":
        return choiceStatus === "notFilled" ? (
          <>
            <DragAndDrop
              allCourses={allCourses}
              setAllCourses={setAllCourses}
              widgets={selectedCourses}
              setWidgets={(value: any) => setSelectedCourses(value)}
            />
            <Footer handleNext={handleNext} loading={loading} />
          </>
        ) : (
          <ConfirmAllotment
            loading={loading}
            setLoading={(value: boolean) => setLoading(value)}
            selectedCourses={selectedCourses}
          />
        );
    }
  };

  const handleConfirm = async () => {
    // setLoading(true);
    // setTimeout(() => {
    //   setLoading(false);
    //   setActiveStep(activeStep + 1);
    //   setStep(step + 1);
    // }, 1000);

    const response = await fetch(
      `${BASE_URL}/students/student/${userId}/verify`,
      {
        method: "PATCH",
      }
    );

    if (response.status === 200) {
      alert("Successfully verified");
      setVerified(true);
    } else {
      alert("Failed to verify");
    }
  };

  if (loading) {
    return (
      <div className={`dark:bg-[#1A202C]`}>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const renderItem = () => {
    if (userAlloted.isAlloted && !loading) {
      return (
        <div className="max-w-2xl mx-5 min-h-screen pb-20 flex flex-col gap-4 items-center justify-center">
          <p className="text-lg dark:text-white text-black text-center">
            Congratulations!
            <br />
            You have been alloted to the following course:
          </p>
          <CoursesCard course={allotedCourse} />
        </div>
      );
    } else {
      if (isUserChosenAllotment && !loading) {
        return (
          <div className="w-full min-h-screen pb-20 flex items-center justify-center">
            <p className="dark:text-white text-black">
              You have already chosen your allotment!
            </p>
          </div>
        );
      } else if (!loading) {
        return (
          <>
            <div className="my-10">
              <Stepper activeStep={activeStep} />
            </div>
            {renderComponent()}
          </>
        );
      }
    }
  };

  return (
    <div className={`dark:bg-[#1A202C]`}>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center">
        {renderItem()}
      </div>
      <ToastContainer />
    </div>
  );
}
