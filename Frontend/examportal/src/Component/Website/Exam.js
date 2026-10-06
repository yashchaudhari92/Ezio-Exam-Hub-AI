import React, { useEffect, useState, useRef } from "react";
import * as faceapi from "face-api.js";
import { loadModels, detectFace, detectMultipleFaces } from "../utils/Facedetect";
import { useSearchParams, useNavigate } from "react-router-dom";
import $ from "jquery";
import API_BASE_URL from "../../helper";
import '../assets/css/exam.css';

function Exam() {

  const videoRef = useRef(null);
  const [faceAwayCount, setFaceAwayCount] = useState(0);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testId = searchParams.get("testId");
  const [showMathKeyboard, setShowMathKeyboard] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loggedUser, setLoggedUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showTimeOutModal, setShowTimeOutModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [testDetails, setTestDetails] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const detectionIntervalRef = useRef(null);
  const noFaceStreakRef = useRef(0);
  const warningCountRef = useRef(0);
  const answersRef = useRef({});
  const [warnings, setWarnings] = useState([]);

  const addWarning = (message) => {
    const id = Date.now();
    setWarnings((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setWarnings((prev) => prev.filter((w) => w.id !== id));
    }, 5000);
  };
  const removeWarning = (id) => {
    setWarnings((prev) => prev.filter((w) => w.id !== id));
  };
  // Logged User
  useEffect(() => {
    const user = localStorage.getItem("loggedUser");
    if (user) setLoggedUser(JSON.parse(user));
  }, []);
  useEffect(() => {
    const blockPaste = (e) => e.preventDefault();
    document.addEventListener("paste", blockPaste);
    return () => {
      document.removeEventListener("paste", blockPaste);
    };
  }, []);

  // Moble Refresh
  useEffect(() => {
    if (!testId || !loggedUser) return;
    $.get(`${API_BASE_URL}/api/exam/check-attempt-exists`, {
      testId: testId,
      userEmail: loggedUser.email
    }, (data) => {
      if (data) {
        setSubmitted(true);
        setTimerStarted(false);
        setResultData({
          totalMarks: data.totalMarks,
          percentage: data.percentage,
          result: data.result
        });
        setShowResultModal(true);
      } else {
        const savedAnswers = localStorage.getItem(`exam_${testId}`);
        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers));
        }
        const savedTime = localStorage.getItem(`exam_time_${testId}`);
        if (savedTime) {
          setTimeLeft(parseInt(savedTime));
          setTimerStarted(true);
          // setShowStartModal(false);
          startWebcam();
        }
      }
    });
  }, [testId, loggedUser]);
  useEffect(() => {
    if (!submitted) {
      localStorage.setItem(`exam_${testId}`, JSON.stringify(answers));
    }
  }, [answers]);

  useEffect(() => {
    if (timerStarted && !submitted) {
      localStorage.setItem(`exam_time_${testId}`, timeLeft);
    }
  }, [timeLeft]);
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && timerStarted && !submitted) {
        localStorage.setItem(`exam_reload_${testId}`, "true");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [timerStarted, submitted]);
  useEffect(() => {
    const reloaded = localStorage.getItem(`exam_reload_${testId}`);
    if (reloaded === "true") {
      localStorage.removeItem(`exam_reload_${testId}`);
      addWarning("⚠ Page refreshed. Continuing exam...");
    }
  }, []);

  // Test Details
  useEffect(() => {
    if (!testId) return;
    $.get(`${API_BASE_URL}/api/test/${testId}`, (data) => {
      setTestDetails(data);
      const [h = 0, m = 0, s = 0] = (data.duration || "00:00:00")
        .split(":")
        .map(Number);
      setTimeLeft(h * 3600 + m * 60 + s);
    });
  }, [testId]);
  // Questions
  useEffect(() => {
    if (!testId) return;
    $.get(`${API_BASE_URL}/api/test/questions/${testId}`, (data) => {
      setQuestions(
        data.sort((a, b) => (a.queNum || 0) - (b.queNum || 0))
      );
    });
  }, [testId]);
  // Timer
  useEffect(() => {
    let timer;
    if (timerStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerStarted, timeLeft]);
  useEffect(() => {
    if (timeLeft === 120 && timerStarted) {
      setShowWarningModal(true);
    }
  }, [timeLeft]);

  // Auto submit
  useEffect(() => {
    if (timeLeft === 0 && timerStarted && !submitted) {
      addWarning("⏳ Time over. Exam auto submitted.");

      setSubmitted(true);
      setTimerStarted(false);
      autoSubmit();
    }
  }, [timeLeft]);
  const formatTime = (sec) =>
    `${String(Math.floor(sec / 3600)).padStart(2, "0")}:${String(
      Math.floor((sec % 3600) / 60)
    ).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  // Option Select
  const handleOptionSelect = (qid, value) => {
    if (!submitted) {
      setAnswers((prev) => ({ ...prev, [qid]: value }));
    }
  };
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  // Preview Button
  const prev = () => {
    stopVoiceTyping();
    if (index > 0) setIndex(index - 1);
  };
  // Next Button
  const next = () => {
    stopVoiceTyping();
    if (index < questions.length - 1) setIndex(index + 1);
  };

  const startExam = async () => {
    try {
      await loadModels();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          startFaceDetection();
        };
      }
      setShowStartModal(false);
      setTimerStarted(true);
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } catch (error) {
      addWarning("⚠ Camera access is required to start exam.");
    }
  };
  useEffect(() => {
    const checkCamera = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch {
        if (timerStarted && !submitted) {
          addWarning("❌ Camera turned off. Exam auto submitted.");
          autoSubmit();
          setSubmitted(true);
          setTimerStarted(false);
        }
      }
    };
    const interval = setInterval(checkCamera, 5000);
    return () => clearInterval(interval);
  }, [timerStarted, submitted]);

  // Full Scree and Tab Change Code Start

  const tabLeaveTimeRef = useRef(null);
  const TAB_MAX_AWAY_TIME = 15000;
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!timerStarted || submitted) return;

      // 👇 USER LEFT TAB
      if (document.hidden) {
        tabLeaveTimeRef.current = Date.now();
        return;
      }

      // 👇 USER RETURNED TO TAB
      if (!document.hidden && tabLeaveTimeRef.current) {
        const awayTime = Date.now() - tabLeaveTimeRef.current;

        // RESET
        tabLeaveTimeRef.current = null;

        // 🚨 IF TIME EXCEEDED → AUTO SUBMIT
        if (awayTime >= TAB_MAX_AWAY_TIME) {
          addWarning("❌ You stayed away too long. Exam auto submitted.");
          autoSubmit(tabSwitchCount + 1, answersRef.current);
          setSubmitted(true);
          setTimerStarted(false);
          return;
        }

        // ⚠ SHOW WARNING ONLY AFTER RETURN
        const newCount = tabSwitchCount + 1;

        if (newCount <= 5) {
          // addWarning(`⚠ Tab switch ${newCount}/5`);
          addWarning(`⚠ Tab switch ${newCount}/5. Max allowed is 5.`);
        }

        if (newCount >= 6) {
          addWarning("❌ Tab switch limit exceeded. Exam auto submitted.");
          autoSubmit(newCount, answersRef.current);
          setSubmitted(true);
          setTimerStarted(false);
        }

        setTabSwitchCount(newCount);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tabSwitchCount, timerStarted, submitted]);

  useEffect(() => {
    const disableCopy = (e) => e.preventDefault();
    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("copy", disableCopy);
    document.addEventListener("contextmenu", disableRightClick);
    return () => {
      document.removeEventListener("copy", disableCopy);
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  // Start Page Refresh Code
  useEffect(() => {
    const preventReload = (e) => {
      if (timerStarted && !submitted) {
        e.preventDefault();
        e.returnValue = ""; // Required for Chrome
      }
    };

    const blockKeys = (e) => {
      // F5
      if (e.key === "F5") {
        e.preventDefault();
      }

      // Ctrl+R / Cmd+R
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
      }

      // Ctrl+Shift+R
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", preventReload);
    document.addEventListener("keydown", blockKeys);

    return () => {
      window.removeEventListener("beforeunload", preventReload);
      document.removeEventListener("keydown", blockKeys);
    };
  }, [timerStarted, submitted]);

  useEffect(() => {
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY;
      if (touchY > touchStartY && window.scrollY === 0) {
        e.preventDefault(); // 🚫 Block pull refresh
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);
  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY;

      if (touchY > touchStartY && window.scrollY === 0) {
        e.preventDefault(); // 🚫 Block pull refresh
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useEffect(() => {
    if (!submitted) {
      const saveInterval = setInterval(() => {
        localStorage.setItem(`exam_${testId}`, JSON.stringify(answersRef.current));
        localStorage.setItem(`exam_time_${testId}`, timeLeft);
      }, 2000);
      return () => clearInterval(saveInterval);
    }
  }, [submitted, testId, timeLeft]);

  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0 && navEntries[0].type === "reload") {
      addWarning("⚠ Page refreshed. Restoring your exam...");
      const savedAnswers = localStorage.getItem(`exam_${testId}`);
      const savedTime = localStorage.getItem(`exam_time_${testId}`);
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
      if (savedTime) {
        setTimeLeft(parseInt(savedTime));
        setTimerStarted(true);
        setShowStartModal(false);
        startWebcam();
      }
    }
  }, []);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === "v")) {
        e.preventDefault();
        alert("Paste is not allowed during the exam.");
      }
      if (e.key === "Escape" && timerStarted && !submitted) {
        const confirmExit = window.confirm(
          "ESC key pressed.\n\nDo you want to exit fullscreen?\nExam will be submitted."
        );
        if (confirmExit) {
          autoSubmit();
          setSubmitted(true);
          setTimerStarted(false);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [timerStarted, submitted]);





  useEffect(() => {
    const blockAdvancedPaste = (e) => {
      if (
        e.inputType === "insertFromPaste" ||
        e.inputType === "insertReplacementText" ||
        e.inputType === "insertFromDrop"
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("beforeinput", blockAdvancedPaste);

    return () => {
      document.removeEventListener("beforeinput", blockAdvancedPaste);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (timerStarted && !submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [timerStarted, submitted]);

  useEffect(() => {
    const handleBack = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
        e.preventDefault();
        alert("Page refresh is disabled during exam.");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  // Full Scree and Tab Change Code End

  // Web Cam Start
  const startWebcam = async () => {
    try {
      await loadModels();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          startFaceDetection();
        };
      }
    } catch (error) {
      alert("Camera access denied or not available");
      console.error(error);
    }
  };

  const MAX_WARNINGS = 10;
  const handleWarning = (message) => {
    warningCountRef.current += 1;

    addWarning(`⚠ Warning ${warningCountRef.current}/${MAX_WARNINGS}: ${message}`);

    // AUTO SUBMIT EXACTLY AT LIMIT
    if (warningCountRef.current >= MAX_WARNINGS) {
      addWarning("❌ Face violation limit exceeded. Exam auto submitted.");
      autoSubmit(tabSwitchCount, answersRef.current);
      setSubmitted(true);
      setTimerStarted(false);
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    }
  };
  const startFaceDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || submitted) return;
      const hasFace = await detectFace(videoRef.current);
      const multipleFaces = await detectMultipleFaces(videoRef.current);
      // GOOD CASE (face present)
      if (hasFace && !multipleFaces) {
        if (noFaceStreakRef.current > 0) {
          noFaceStreakRef.current -= 1;
        }
        return;
      }
      if (multipleFaces) {
        handleWarning("Multiple faces detected. Only one person allowed.");
        return;
      }
      if (!hasFace) {
        noFaceStreakRef.current += 1;
        console.log("No face streak:", noFaceStreakRef.current);
        if (noFaceStreakRef.current < 10) {
          return;
        }
        if (noFaceStreakRef.current === 10) {
          handleWarning("Please stay in front of camera");
        }
        if (noFaceStreakRef.current >= 11) {
          noFaceStreakRef.current = 0;
        }
      }
    }, 4000);
  };
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);
  // Web Cam End

  // Voice Start
  const startVoiceTyping = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }
    const recognition = new SpeechRecognition();
    let langCode = "en-US";
    if (testDetails?.language === "Hindi") {
      langCode = "hi-IN";
    }
    else if (testDetails?.language === "Marathi") {
      langCode = "mr-IN";
    }
    recognition.lang = langCode;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onstart = () => {
      setListening(true);
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript;
          setAnswers((prev) => ({
            ...prev,
            [current.queId]: (prev[current.queId] || "") + " " + transcript
          }));
        }
      }
    };
    recognition.start();
    recognitionRef.current = recognition;
  };
  const stopVoiceTyping = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };
  // Voice End
  const addMathSymbol = (symbol) => {
    setAnswers((prev) => ({
      ...prev,
      [current.queId]: (prev[current.queId] || "") + symbol
    }));
  };
  const mathSymbols = [
    "+", "-", "×", "÷", "=", "≠", "<", ">", "≤", "≥",
    "π", "√", "^", "%", "∞",
    "(", ")", "[", "]", "{", "}",
    "sin", "cos", "tan", "log"
  ];
  function cancelExam() {
    navigate("/");
  }
  const buildPayload = (overrideTabCount = tabSwitchCount, overrideAnswers = answers) => ({
    testId: Number(testId),
    userName: loggedUser?.name || "",
    userEmail: loggedUser?.email || "",
    instituteName: loggedUser?.institute || "",
    tabSwitchCount: overrideTabCount,
    answers: overrideAnswers,
  });
  const clearExamStorage = () => {
    localStorage.removeItem(`exam_${testId}`);
    localStorage.removeItem(`exam_time_${testId}`);
  };
  const submitExam = () => {
    if (submitted) return;
    setSubmitted(true);
    setTimerStarted(false);
    setLoadingSubmit(true);
    $.ajax({
      url: `${API_BASE_URL}/api/exam/submit`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(buildPayload()),
      success: (res) => {
        setResultData(res);
        setSuccessMessage("Exam Submitted Successfully!");
        clearExamStorage();
        setShowSuccessModal(true);
      },
      error: (err) => {
        alert(err.responseText || "Exam submission failed");
      },
      complete: () => setLoadingSubmit(false),
    });
  };
  const autoSubmit = (overrideTabCount, overrideAnswers) => {
    $.ajax({
      url: `${API_BASE_URL}/api/exam/submit`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(
        buildPayload(
          overrideTabCount ?? tabSwitchCount,
          overrideAnswers ?? answers
        )
      ),
      success: (res) => {
        setResultData(res);
        setSuccessMessage("Exam Submitted Successfully!");
        clearExamStorage();
        setShowSuccessModal(true);
      },
    });
  };

//   if (!testDetails || questions.length === 0) {
//     return (
//       <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
//         <div className="text-center">
//           <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
//           <p className="mt-4 text-sm font-semibold text-white">
//             Preparing Examination
//           </p>
//           <p className="mt-1 text-xs text-slate-500">
//             Please wait...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const current = questions[index];

//   const answeredCount = Object.keys(answers).filter(
//     (key) =>
//       answers[key] !== undefined &&
//       answers[key] !== null &&
//       String(answers[key]).trim() !== ""
//   ).length;

//   const remainingCount = Math.max(
//     questions.length - answeredCount,
//     0
//   );

//   const progress =
//     questions.length > 0
//       ? ((index + 1) / questions.length) * 100
//       : 0;

//   return (
//     <div className="fixed inset-0 z-0 flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f4f6f9] text-slate-900">

//       {/* =========================================================
//         START EXAM MODAL
//     ========================================================= */}

//       {showStartModal && (
//         <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">

//           <div className="flex max-h-[calc(100dvh-32px)] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

//             {/* Header */}

//             <div className="bg-[#080d20] px-7 py-6 text-white">

//               <div className="flex items-center gap-4">

//                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xl">
//                   📝
//                 </div>

//                 <div>
//                   <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">
//                     Ezio Exam Hub
//                   </p>

//                   <h2 className="mt-1 text-xl font-bold">
//                     {testDetails?.topicName || "Examination"}
//                   </h2>

//                   <p className="mt-1 text-xs text-slate-400">
//                     Examination Workspace
//                   </p>
//                 </div>

//               </div>

//             </div>

//             {/* Examination information */}

//             <div className="min-h-0 overflow-y-auto p-6">

//               <div className="grid grid-cols-2 gap-3">

//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
//                   <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
//                     Questions
//                   </p>

//                   <p className="mt-2 text-lg font-bold text-slate-900">
//                     {questions.length}
//                   </p>
//                 </div>

//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
//                   <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
//                     Duration
//                   </p>

//                   <p className="mt-2 text-lg font-bold text-slate-900">
//                     {testDetails?.duration || "N/A"}
//                   </p>
//                 </div>

//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
//                   <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
//                     Examination Type
//                   </p>

//                   <p className="mt-2 text-sm font-bold text-slate-900">
//                     {testDetails?.examType || "N/A"}
//                   </p>
//                 </div>

//                 <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
//                   <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600">
//                     Proctoring
//                   </p>

//                   <div className="mt-2 flex items-center gap-2">

//                     <span className="h-2 w-2 rounded-full bg-emerald-500" />

//                     <p className="text-sm font-bold text-emerald-700">
//                       Enabled
//                     </p>

//                   </div>
//                 </div>

//               </div>

//               {/* Examination Rules */}

//               <div className="mt-5 rounded-xl border border-slate-200 bg-white">

//                 <div className="border-b border-slate-200 px-4 py-3">

//                   <div className="flex items-center gap-2">

//                     <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-sm">
//                       ⚠️
//                     </span>

//                     <div>

//                       <p className="text-xs font-bold text-slate-900">
//                         Before you begin
//                       </p>

//                       <p className="mt-0.5 text-[9px] text-slate-400">
//                         Please read the examination instructions carefully.
//                       </p>

//                     </div>

//                   </div>

//                 </div>

//                 <div className="grid grid-cols-1 gap-2 p-4 text-[10px] leading-5 text-slate-600 sm:grid-cols-2">

//                   <div>• Do not switch tabs.</div>

//                   <div>• Maximum 5 tab switches.</div>

//                   <div>• Webcam must remain enabled.</div>

//                   <div>• Multiple faces are not permitted.</div>

//                   <div>• Do not refresh the page.</div>

//                   <div>• Copy/paste is disabled.</div>

//                   <div>• Screenshots are not permitted.</div>

//                   <div>• 15+ seconds away may auto-submit.</div>

//                 </div>

//               </div>

//               {/* Buttons */}

//               <div className="mt-6 grid grid-cols-2 gap-3">

//                 <button
//                   onClick={cancelExam}
//                   className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   onClick={startExam}
//                   className="rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
//                 >
//                   Start Examination
//                 </button>

//               </div>

//             </div>

//           </div>

//         </div>
//       )}

//       {/* =========================================================
//         WARNING MODAL
//     ========================================================= */}

//       {showWarningModal && (
//         <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">

//           <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">

//             <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-2xl">
//               ⏰
//             </div>

//             <h3 className="mt-4 text-lg font-bold text-red-600">
//               Last 2 Minutes
//             </h3>

//             <p className="mt-2 text-xs leading-5 text-slate-500">
//               Your examination is almost over. Please complete your remaining
//               questions.
//             </p>

//             <button
//               onClick={() => setShowWarningModal(false)}
//               className="mt-5 w-full rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700"
//             >
//               Continue Examination
//             </button>

//           </div>

//         </div>
//       )}

//       {/* =========================================================
//         TIME OUT
//     ========================================================= */}

//       {showTimeOutModal && (
//         <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">

//           <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">

//             <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-2xl">
//               ⏳
//             </div>

//             <h3 className="mt-4 text-lg font-bold text-slate-900">
//               Time Over
//             </h3>

//             <p className="mt-2 text-xs leading-5 text-slate-500">
//               Your examination time has ended.
//             </p>

//             <button
//               onClick={() => {
//                 setShowTimeOutModal(false);
//                 setShowResultModal(true);
//               }}
//               className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
//             >
//               View Result
//             </button>

//           </div>

//         </div>
//       )}

//       {/* =========================================================
//         RESULT MODAL
//     ========================================================= */}

//       {showResultModal && resultData && (
//         <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">

//           <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">

//             <div
//               className={`px-6 py-7 text-center text-white ${resultData.result === "PASS"
//                 ? "bg-emerald-600"
//                 : "bg-red-600"
//                 }`}
//             >

//               <div className="text-4xl">
//                 {resultData.result === "PASS" ? "✓" : "!"}
//               </div>

//               <h2 className="mt-3 text-xl font-bold">
//                 {resultData.result === "PASS"
//                   ? "Congratulations!"
//                   : "Examination Completed"}
//               </h2>

//               <p className="mt-1 text-xs text-white/75">
//                 {resultData.result === "PASS"
//                   ? "You passed the examination."
//                   : "Thank you for completing the examination."}
//               </p>

//             </div>

//             <div className="p-5">

//               <div className="grid grid-cols-2 gap-3">

//                 <div className="rounded-xl bg-slate-50 p-4 text-center">

//                   <p className="text-[9px] uppercase tracking-wider text-slate-400">
//                     Marks
//                   </p>

//                   <p className="mt-1 text-xl font-bold">
//                     {resultData.totalMarks}
//                   </p>

//                 </div>

//                 <div className="rounded-xl bg-slate-50 p-4 text-center">

//                   <p className="text-[9px] uppercase tracking-wider text-slate-400">
//                     Percentage
//                   </p>

//                   <p className="mt-1 text-xl font-bold">
//                     {resultData.percentage}%
//                   </p>

//                 </div>

//               </div>

//               <button
//                 onClick={() => {
//                   setShowResultModal(false);
//                   navigate("/");
//                 }}
//                 className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
//               >
//                 Return to Home
//               </button>

//             </div>

//           </div>

//         </div>
//       )}

//       {/* =========================================================
//         WARNING TOASTS
//     ========================================================= */}

//       {warnings.length > 0 && (
//         <div className="fixed right-4 top-4 z-[100000] w-[min(360px,calc(100vw-2rem))] space-y-2">

//           {warnings.map((w) => (
//             <div
//               key={w.id}
//               className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-600 p-3 text-white shadow-xl"
//             >

//               <span className="text-sm">
//                 ⚠
//               </span>

//               <span className="min-w-0 flex-1 text-xs leading-5">
//                 {w.message}
//               </span>

//               <button
//                 onClick={() => removeWarning(w.id)}
//                 className="text-xs text-white/70 hover:text-white"
//               >
//                 ✕
//               </button>

//             </div>
//           ))}

//         </div>
//       )}

//       {/* =========================================================
//         TOP EXAMINATION HEADER
//     ========================================================= */}

//       <header className="flex h-[72px] shrink-0 items-center border-b border-slate-800 bg-[#070b1b] px-5 text-white sm:px-7">

//         {/* LEFT - EXAMINATION */}

//         <div className="flex min-w-0 flex-1 items-center gap-3">

//           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-base">
//             📝
//           </div>

//           <div className="min-w-0">

//             <p className="text-[8px] font-semibold uppercase tracking-[0.22em] py-3 text-slate-500">
//               Ezio Exam Hub
//             </p>

//             <h1 className="mt-0.5 truncate text-lg font-bold tracking-tight sm:text-[22px]">
//               {testDetails.topicName}
//             </h1>

//           </div>

//         </div>


//         {/* CENTER */}

//         <div className="hidden items-center gap-2 lg:flex">

//           <div className="rounded-lg border border-slate-700 px-3 py-1.5">

//             <span className="text-[8px] uppercase tracking-wider text-slate-500">
//               Candidate
//             </span>

//             <span className="ml-2 text-[10px] font-semibold text-slate-200">
//               {loggedUser?.name}
//             </span>

//           </div>

//           <div className="rounded-lg border border-slate-700 px-3 py-1.5">

//             <span className="text-[8px] uppercase tracking-wider text-slate-500">
//               Type
//             </span>

//             <span className="ml-2 text-[10px] font-semibold text-slate-200">
//               {testDetails.examType}
//             </span>

//           </div>

//         </div>


//         {/* RIGHT */}

//         <div className="flex flex-1 items-center justify-end gap-2">

//           <div className="hidden items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 sm:flex">

//             <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

//             <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400">
//               Proctored
//             </span>

//           </div>

//           {/* <div
//             className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${timeLeft <= 120
//               ? "border-red-500/40 bg-red-500/10"
//               : "border-slate-700 bg-slate-900"
//               }`}
//           >

//             <span className="text-[11px]">
//               ⏱
//             </span>

//             <p
//               className={`font-mono text-xs font-bold ${timeLeft <= 120
//                 ? "text-red-400"
//                 : "text-white"
//                 }`}
//             >
//               {formatTime(timeLeft)}
//             </p>

//           </div> */}

//         </div>

//       </header>

//       {/* =========================================================
//         MAIN EXAM WORKSPACE
//     ========================================================= */}

//       <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px]">

//         {/* =======================================================
//           LEFT QUESTION WORKSPACE
//       ======================================================= */}

//         <section className="flex min-h-0 min-w-0 flex-col bg-[#f4f6f9]">

//           {/* QUESTION STATUS BAR */}

//           <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-7">

//             {/* QUESTION INFORMATION */}

//             <div className="flex items-center gap-3">

//               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-bold text-white">
//                 {index + 1}
//               </div>

//               <div>

//                 <p className="text-[11px] font-bold tracking-tight text-slate-900 sm:text-xs">
//                   Question {index + 1} of {questions.length}
//                 </p>

//                 <p className="mt-1 text-[9px] text-slate-400">
//                   {answers[current.queId]
//                     ? "Answered"
//                     : "Not answered"}
//                 </p>

//               </div>

//             </div>


//             {/* PROGRESS */}

//             <div className="flex items-center gap-2.5">

//               <div className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-slate-100 sm:block">

//                 <div
//                   className="h-full rounded-full bg-indigo-600 transition-all duration-300"
//                   style={{ width: `${progress}%` }}
//                 />

//               </div>

//               <span className="text-[9px] font-bold text-slate-400">
//                 {Math.round(progress)}%
//               </span>

//             </div>

//           </div>

//           {/* =====================================================
//             QUESTION AREA
//         ===================================================== */}

//           <div className="min-h-0 flex-1 overflow-y-auto">

//             <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-7 lg:px-10">

//               <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">

//                 {/* QUESTION */}

//                 <div className="border-b border-slate-100 px-6 py-7 sm:px-8 sm:py-8">

//                   <div className="flex gap-4">

//                     <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-bold text-white">
//                       Q{index + 1}
//                     </span>

//                     <h2 className="text-[19px] font-semibold leading-8 text-slate-900 sm:text-[21px]">
//                       {current.questions}
//                     </h2>

//                   </div>

//                 </div>

//                 {/* =================================================
//                   MCQ OPTIONS
//               ================================================= */}

//                 {testDetails.examType === "MCQ" ? (

//                   <div className="space-y-3 px-5 py-7 sm:px-8 sm:py-8">

//                     {["option1", "option2", "option3", "option4"].map(
//                       (o, i) =>
//                         current[o] && (

//                           <label
//                             key={i}
//                             className={`flex min-h-[68px] w-full cursor-pointer items-center gap-4 rounded-xl px-5 py-4 transition-all duration-150 ${answers[current.queId] === current[o]
//                               ? "bg-indigo-50 ring-2 ring-indigo-500"
//                               : "bg-slate-50 ring-1 ring-slate-200 hover:bg-slate-100 hover:ring-slate-300"
//                               }`}
//                           >

//                             {/* HIDDEN RADIO */}

//                             <input
//                               type="radio"
//                               className="sr-only"
//                               checked={
//                                 answers[current.queId] === current[o]
//                               }
//                               onChange={() =>
//                                 handleOptionSelect(
//                                   current.queId,
//                                   current[o]
//                                 )
//                               }
//                             />


//                             {/* SINGLE RADIO INDICATOR */}

//                             <span
//                               className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${answers[current.queId] === current[o]
//                                 ? "border-indigo-600"
//                                 : "border-slate-300 bg-white"
//                                 }`}
//                             >

//                               {answers[current.queId] === current[o] && (
//                                 <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
//                               )}

//                             </span>


//                             {/* OPTION TEXT */}

//                             <span
//                               className={`min-w-0 flex-1 text-[13px] leading-6 sm:text-[14px] ${answers[current.queId] === current[o]
//                                 ? "font-medium text-indigo-900"
//                                 : "text-slate-700"
//                                 }`}
//                             >
//                               {current[o]}
//                             </span>

//                           </label>

//                         )
//                     )}

//                   </div>

//                 ) : (

//                   /* =================================================
//                      THEORY
//                   ================================================= */

//                   <div className="p-5 sm:p-8">

//                     <div className="overflow-hidden rounded-xl border border-slate-200">

//                       <textarea
//                         className="min-h-[250px] w-full resize-y border-0 p-4 text-sm leading-7 outline-none placeholder:text-slate-400"
//                         placeholder="Write your answer here..."
//                         value={answers[current.queId] || ""}
//                         onChange={(e) =>
//                           handleOptionSelect(
//                             current.queId,
//                             e.target.value
//                           )
//                         }
//                         onPaste={(e) => e.preventDefault()}
//                         onKeyDown={(e) => {

//                           if (
//                             (e.ctrlKey || e.metaKey) &&
//                             ["v", "c", "x"].includes(
//                               e.key.toLowerCase()
//                             )
//                           ) {
//                             e.preventDefault();
//                           }

//                         }}
//                         onBeforeInput={(e) => {

//                           if (
//                             e.inputType === "insertFromPaste" ||
//                             e.inputType === "insertFromDrop" ||
//                             e.inputType === "insertReplacementText" ||
//                             e.inputType === "insertFromYank"
//                           ) {
//                             e.preventDefault();
//                           }

//                         }}
//                         onInput={(e) => {

//                           const previous =
//                             answers[current.queId] || "";

//                           const value = e.target.value;

//                           if (value.length - previous.length > 20) {
//                             e.target.value = previous;
//                             return;
//                           }

//                           handleOptionSelect(
//                             current.queId,
//                             value
//                           );

//                         }}
//                         autoComplete="off"
//                         autoCorrect="off"
//                         autoCapitalize="off"
//                         spellCheck={false}
//                         disabled={submitted}
//                       />

//                       <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2">

//                         <span className="text-[9px] text-slate-400">
//                           Paste disabled
//                         </span>

//                         <span className="text-[9px] text-slate-400">
//                           {answers[current.queId]?.length || 0} characters
//                         </span>

//                       </div>

//                     </div>

//                   </div>

//                 )}

//               </div>

//             </div>

//           </div>

//           {/* =====================================================
//             BOTTOM NAVIGATION
//         ===================================================== */}

//           <div className="flex h-[62px] shrink-0 items-center justify-between border-t border-slate-200 bg-white px-4 sm:px-6">

//             <button
//               onClick={prev}
//               disabled={index === 0 || submitted}
//               className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               ← Previous
//             </button>

//             {testDetails.examType === "Theory" && (
//               <div className="flex items-center gap-2">

//                 <button
//                   onClick={() =>
//                     listening
//                       ? stopVoiceTyping()
//                       : startVoiceTyping()
//                   }
//                   className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${listening
//                     ? "bg-red-500 text-white"
//                     : "bg-amber-100 text-amber-700"
//                     }`}
//                 >
//                   {listening ? "🔇" : "🎙"}
//                 </button>

//                 <button
//                   onClick={() => setShowMathKeyboard(true)}
//                   className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700"
//                 >
//                   π
//                 </button>

//               </div>
//             )}

//             <button
//               onClick={next}
//               disabled={
//                 index === questions.length - 1 ||
//                 submitted
//               }
//               className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Next →
//             </button>

//           </div>

//         </section>

//         {/* =======================================================
//           RIGHT CONTROL PANEL
//       ======================================================= */}

//         <aside className="hidden min-h-0 flex-col border-l border-slate-200 bg-white lg:flex">

//           {/* =====================================================
//             COMPACT PROCTORING
//         ===================================================== */}

//           <div className="shrink-0 border-b border-slate-200 p-3.5">

//             <div className="mb-2.5 flex items-center justify-between">

//               <div>

//                 <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-900">
//                   Proctoring
//                 </p>

//                 <div className="mt-1 flex items-center gap-1.5">

//                   <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />

//                   <span className="text-[8px] font-medium text-emerald-600">
//                     Monitoring Active
//                   </span>

//                 </div>

//               </div>

//               <span className="rounded-md bg-emerald-50 px-2 py-1 text-[7px] font-bold uppercase text-emerald-600">
//                 LIVE
//               </span>

//             </div>

//             {/* CAMERA */}

//             <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-950">

//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 className="h-full w-full object-cover"
//               />

//               <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-1 backdrop-blur">

//                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

//                 <span className="text-[7px] font-medium text-white">
//                   Camera Active
//                 </span>

//               </div>

//             </div>

//             {/* CANDIDATE */}

//             <div className="mt-2.5 flex items-center justify-between">

//               <div className="min-w-0">

//                 <p className="text-[7px] uppercase tracking-wider text-slate-400">
//                   Candidate
//                 </p>

//                 <p className="mt-0.5 truncate text-[10px] font-bold text-slate-900">
//                   {loggedUser?.name}
//                 </p>

//               </div>

//               <div className="text-right">

//                 <p className="text-[7px] uppercase tracking-wider text-slate-400">
//                   Status
//                 </p>

//                 <p className="mt-0.5 text-[9px] font-bold text-emerald-600">
//                   Verified
//                 </p>

//               </div>

//             </div>

//           </div>

//           {/* =====================================================
//             COMPACT TIMER
//         ===================================================== */}

//           <div className="shrink-0 border-b border-slate-200 px-3.5 py-3">

//             <div
//               className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${timeLeft <= 120
//                 ? "border-red-200 bg-red-50"
//                 : "border-slate-200 bg-slate-50"
//                 }`}
//             >

//               <div>

//                 <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-slate-400">
//                   Time Remaining
//                 </p>

//                 <p
//                   className={`mt-0.5 font-mono text-base font-bold tracking-wider ${timeLeft <= 120
//                     ? "text-red-600"
//                     : "text-slate-900"
//                     }`}
//                 >
//                   {formatTime(timeLeft)}
//                 </p>

//               </div>

//               <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs shadow-sm">
//                 ⏱
//               </div>

//             </div>

//           </div>

//           {/* =====================================================
//             QUESTION NAVIGATOR
//         ===================================================== */}

//           <div className="flex min-h-0 flex-1 flex-col">

//             <div className="shrink-0 border-b border-slate-100 px-3.5 py-3">

//               <div className="flex items-center justify-between">

//                 <div>

//                   <p className="text-[10px] font-bold text-slate-900">
//                     Question Navigator
//                   </p>

//                   <p className="mt-0.5 text-[8px] text-slate-400">
//                     {answeredCount} answered · {remainingCount} remaining
//                   </p>

//                 </div>

//                 <span className="rounded-md bg-indigo-50 px-2 py-1 text-[8px] font-bold text-indigo-600">
//                   {index + 1}/{questions.length}
//                 </span>

//               </div>

//             </div>

//             {/* 
//               SHOW 40 QUESTIONS INITIALLY.
//               5 COLUMNS × 8 ROWS.
//               SIDEBAR SCROLLS FOR THE REMAINING QUESTIONS.
//           */}

//             <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">

//               <div className="grid grid-cols-5 gap-1.5">

//                 {questions.map((q, i) => {

//                   const isCurrent = i === index;

//                   const isAttempted = Boolean(
//                     answers[q.queId]
//                   );

//                   return (
//                     <button
//                       key={i}
//                       onClick={() => {

//                         stopVoiceTyping();
//                         setIndex(i);

//                       }}
//                       disabled={submitted}
//                       title={`Question ${i + 1}`}
//                       className={`flex h-8 w-full items-center justify-center rounded-md border text-[9px] font-bold transition ${isCurrent
//                         ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
//                         : isAttempted
//                           ? "border-emerald-500 bg-emerald-500 text-white"
//                           : "border-slate-200 bg-white text-slate-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
//                         }`}
//                     >
//                       {i + 1}
//                     </button>
//                   );

//                 })}

//               </div>

//               {/* LEGEND */}

//               <div className="mt-3 border-t border-slate-100 pt-3">

//                 <div className="grid grid-cols-3 gap-1">

//                   <div className="flex items-center gap-1">

//                     <span className="h-2 w-2 rounded bg-indigo-600" />

//                     <span className="text-[7px] text-slate-500">
//                       Current
//                     </span>

//                   </div>

//                   <div className="flex items-center gap-1">

//                     <span className="h-2 w-2 rounded bg-emerald-500" />

//                     <span className="text-[7px] text-slate-500">
//                       Answered
//                     </span>

//                   </div>

//                   <div className="flex items-center gap-1">

//                     <span className="h-2 w-2 rounded border border-slate-300" />

//                     <span className="text-[7px] text-slate-500">
//                       Pending
//                     </span>

//                   </div>

//                 </div>

//               </div>

//             </div>

//           </div>

//           {/* =====================================================
//             SUBMIT PANEL
//         ===================================================== */}

//           <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-3.5">

//             <div className="mb-2.5 flex items-center justify-between">

//               <div>

//                 <p className="text-[7px] uppercase tracking-wider text-slate-400">
//                   Progress
//                 </p>

//                 <p className="mt-0.5 text-xs font-bold text-slate-900">
//                   {answeredCount} / {questions.length}
//                 </p>

//               </div>

//               <div className="text-right">

//                 <p className="text-[7px] uppercase tracking-wider text-slate-400">
//                   Remaining
//                 </p>

//                 <p className="mt-0.5 text-xs font-bold text-slate-900">
//                   {remainingCount}
//                 </p>

//               </div>

//             </div>

//             <button
//               onClick={() => setShowSubmitConfirm(true)}
//               disabled={submitted || loadingSubmit}
//               className="w-full rounded-lg bg-emerald-600 py-2.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               {loadingSubmit
//                 ? "Submitting..."
//                 : "Submit Examination"}
//             </button>

//           </div>

//         </aside>

//       </div>

//       {/* =========================================================
//         MOBILE BOTTOM BAR
//     ========================================================= */}

//       <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white p-2 shadow-2xl lg:hidden">

//         <div className="flex items-center gap-2">

//           <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">

//             {questions.map((q, i) => {

//               const isCurrent = i === index;

//               const isAttempted = Boolean(
//                 answers[q.queId]
//               );

//               return (
//                 <button
//                   key={i}
//                   onClick={() => {

//                     stopVoiceTyping();
//                     setIndex(i);

//                   }}
//                   disabled={submitted}
//                   className={`h-8 w-8 shrink-0 rounded-md border text-[9px] font-bold ${isCurrent
//                     ? "border-indigo-600 bg-indigo-600 text-white"
//                     : isAttempted
//                       ? "border-emerald-500 bg-emerald-500 text-white"
//                       : "border-slate-200 bg-white text-slate-600"
//                     }`}
//                 >
//                   {i + 1}
//                 </button>
//               );

//             })}

//           </div>

//           <button
//             onClick={() => setShowSubmitConfirm(true)}
//             disabled={submitted || loadingSubmit}
//             className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white"
//           >
//             Submit
//           </button>

//         </div>

//       </div>

//       {/* =========================================================
//         SUBMIT CONFIRMATION
//     ========================================================= */}

//       {showSubmitConfirm && (
//         <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">

//           <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

//             <div className="text-center">

//               <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-2xl">
//                 ⚠️
//               </div>

//               <h3 className="mt-4 text-lg font-bold text-slate-900">
//                 Submit Examination?
//               </h3>

//               <p className="mt-2 text-xs leading-5 text-slate-500">
//                 You have answered {answeredCount} out of{" "}
//                 {questions.length} questions.
//                 <br />
//                 Are you sure you want to submit?
//               </p>

//             </div>

//             <div className="mt-5 grid grid-cols-2 gap-2.5">

//               <button
//                 onClick={() => setShowSubmitConfirm(false)}
//                 className="rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
//               >
//                 Review
//               </button>

//               <button
//                 onClick={() => {

//                   setShowSubmitConfirm(false);
//                   submitExam();

//                 }}
//                 className="rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
//               >
//                 Yes, Submit
//               </button>

//             </div>

//           </div>

//         </div>
//       )}

//       {/* =========================================================
//         SUCCESS
//     ========================================================= */}

//       {showSuccessModal && (
//         <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">

//           <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">

//             <div className="bg-emerald-600 px-6 py-7 text-center text-white">

//               <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-3xl">
//                 ✓
//               </div>

//               <h2 className="mt-3 text-xl font-bold">
//                 Examination Submitted
//               </h2>

//               <p className="mt-1 text-xs text-emerald-50">
//                 {successMessage}
//               </p>

//             </div>

//             <div className="p-5">

//               <button
//                 onClick={() => {

//                   setShowSuccessModal(false);
//                   navigate("/");

//                 }}
//                 className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
//               >
//                 Continue
//               </button>

//             </div>

//           </div>

//         </div>
//       )}

//       {/* =========================================================
//         MATH KEYBOARD
//     ========================================================= */}

//       {showMathKeyboard && (
//         <div className="fixed inset-0 z-[99998] flex items-end justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:items-center">

//           <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

//             <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

//               <div>

//                 <h3 className="text-sm font-bold text-slate-900">
//                   Mathematical Keyboard
//                 </h3>

//                 <p className="mt-1 text-[9px] text-slate-400">
//                   Insert a symbol into your answer.
//                 </p>

//               </div>

//               <button
//                 onClick={() => setShowMathKeyboard(false)}
//                 className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500 hover:bg-slate-200"
//               >
//                 ✕
//               </button>

//             </div>

//             <div className="max-h-[50vh] overflow-y-auto p-4">

//               <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">

//                 {mathSymbols.map((sym, i) => (

//                   <button
//                     key={i}
//                     onClick={() => addMathSymbol(sym)}
//                     className="min-h-10 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
//                   >
//                     {sym}
//                   </button>

//                 ))}

//               </div>

//             </div>

//           </div>

//         </div>
//       )}

//     </div>
//   );
// }

// export default Exam;


  if (!testDetails || questions.length === 0) {
    return <h3 className="text-center mt-5">Loading Exam...</h3>;
  }
  const current = questions[index];
  return (
    <div className="container-fluid border border-2 p-0">
      {/* START MODAL */}
      {showStartModal && (
        <div
          className="modal-backdrop show d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.6)", opacity: 99999, position: "fixed", inset: 0 }} >
          <div className="bg-white p-4 rounded-3 mx-2" style={{ width: "350px" }}>
            <h5 className="text-center text-dark">Start Exam?</h5>
            <p className="text-center text-dark">Time will start immediately. Ready?</p>
            <div className="text-center mt-3">
              <button className="btn btn-success me-2" onClick={startExam}>
                Yes
              </button>
              <button className="btn btn-danger" onClick={cancelExam}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 2-Min Warning Modal */}
      {showWarningModal && (
        <div
          className="modal-backdrop show d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.6)", opacity: 99999, position: "fixed", inset: 0 }} >
          <div className="bg-white p-4 rounded-3" style={{ width: "350px" }}>
            <h5 className="text-center text-danger">⚠ Last 2 Minutes!</h5>
            <p className="text-center">Hurry up — only 2 minutes left.</p>
            <div className="text-center mt-3">
              <button className="btn btn-warning" onClick={() => setShowWarningModal(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {/* TIME OUT Modal (shown after auto-submit) */}
      {showTimeOutModal && (
        <div className="modal-backdrop show d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.6)", opacity: 99999, position: "fixed", inset: 0 }} >
          <div className="bg-white p-4 rounded-3" style={{ width: "350px" }}>
            <h5 className="text-center text-danger">⏳ Exam Time Stopped / Time Out</h5>
            <p className="text-center">Your exam time is over. Click OK to see result.</p>
            <div className="text-center mt-3">
              <button className="btn btn-primary" onClick={() => { setShowTimeOutModal(false); setShowResultModal(true); }} >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {/* RESULT MODAL */}
      {showResultModal && resultData && (
        <div className="modal-backdrop show d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.6)", opacity: 99999, position: "fixed", inset: 0 }} >
          <div className="bg-white p-4 rounded-3" style={{ width: "400px" }}>
            {resultData.result === "PASS" ? (
              <>
                <h4 className="text-center text-success">🎉 Congratulations! You Passed</h4>
                <p className="text-center">
                  Marks Obtained: <b>{resultData.totalMarks}</b>
                </p>
                <p className="text-center">
                  Percentage: <b>{resultData.percentage}%</b>
                </p>
              </>
            ) : (
              <>
                <h4 className="text-center text-danger">😞 You Failed</h4>
                <p className="text-center">Marks Obtained: {resultData.totalMarks}</p>
              </>
            )}
            <div className="text-center mt-3">
              <button className="btn btn-primary" onClick={() => { setShowResultModal(false); navigate("/"); }} >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ background: "#6eaf1596" }}>
        <h1 className="py-4 text-center text-dark"> {loggedUser?.institute} Online Exam </h1>
      </div>
      <div className="container-fluid row align-items-center">
        <div className="col-md-7 mb-2">
          <p className="m-0"> <b>Exam Name :</b> {testDetails.topicName} </p>
          {/* <p className="text-danger"> <b>Note :</b> {testDetails.note} </p> */}
          <pre className="text-danger fw-semibold" style={{ whiteSpace: "pre-wrap" }}>
            <b>Note:</b> <br></br>
            1. Do not switch tabs while taking the exam. <br></br>
            2. The exam will be automatically submitted after switching tabs 5 times. <br></br>
            3. The exam will be automatically submitted if you switch tabs for more than 15 seconds. <br></br>
            4. Do not turn off your webcam while taking the exam. <br></br>
            5. Multiple faces are not permitted while taking the exam. <br></br>
            6. The exam will be automatically submitted if a face is not detected 10 times. <br></br>
            7. Do not refresh the page while taking the exam. <br></br>
            8. Do not paste answers while taking the exam. <br></br>
            9. Do not take screenshots while taking the exam. <br></br>
          </pre>
        </div>
        <div className="col-md-5 mb-2">
          <div className="text-center">
            <video ref={videoRef} autoPlay playsInline
              style={{ width: "200px", height: "180px", border: "2px solid black", borderRadius: "10px" }}></video>
          </div>
        </div>
      </div>
      {warnings.length > 0 && (
        <div style={{ position: "fixed", top: "15px", right: "15px", width: "320px", zIndex: 99999, }}>
          {warnings.map((w) => (
            <div key={w.id} className="bg-danger text-white p-3 mb-2 rounded shadow d-flex justify-content-between align-items-start" >
              <span style={{ fontSize: "14px" }}>{w.message}</span>
              <button onClick={() => removeWarning(w.id)} style={{ background: "transparent", border: "none", color: "white", fontSize: "16px", cursor: "pointer", marginLeft: "10px" }}>
                ✖
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Exam Container */}
      <div className="row w-100 border border-dark mt-5 mx-0 ">
        <div className="col-md-7 p-4 border-end border-dark">
          <h5>Q{index + 1}. {current.questions}</h5>
          {testDetails.examType === "MCQ" ? (
            ["option1", "option2", "option3", "option4"].map((o, i) => (
              current[o] && (
                <div key={i} className="form-check mb-2">
                  <input type="radio" className="form-check-input" checked={answers[current.queId] === current[o]}
                    onChange={() => handleOptionSelect(current.queId, current[o])} />
                  <label className="form-check-label">{current[o]}</label>
                </div>
              )
            ))
          ) : (
            <div className="mt-3">


              <textarea
                className="form-control"
                rows="5"
                placeholder="Write your answer here..."
                value={answers[current.queId] || ""}
                onChange={(e) => handleOptionSelect(current.queId, e.target.value)}

                // 🚫 BLOCK NORMAL PASTE
                onPaste={(e) => e.preventDefault()}

                // 🚫 BLOCK KEYBOARD SHORTCUTS
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && ["v", "c", "x"].includes(e.key.toLowerCase())) {
                    e.preventDefault();
                  }
                }}

                // 🚫 BLOCK MOBILE KEYBOARD PASTE + SUGGESTION BAR
                onBeforeInput={(e) => {
                  if (
                    e.inputType === "insertFromPaste" ||
                    e.inputType === "insertFromDrop" ||
                    e.inputType === "insertReplacementText" ||
                    e.inputType === "insertFromYank"
                  ) {
                    e.preventDefault();
                  }
                }}

                // 🚫 EXTRA SECURITY (detect sudden large insert)
                onInput={(e) => {
                  const prev = answers[current.queId] || "";
                  const curr = e.target.value;

                  // If sudden large jump → assume paste → block
                  if (curr.length - prev.length > 20) {
                    e.target.value = prev;
                    return;
                  }

                  handleOptionSelect(current.queId, curr);
                }}

                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}

                disabled={submitted}
              />
            </div>
          )}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <button className="btn btn-info text-light" onClick={prev}>
              <i class="pe-1 fa-solid fa-arrow-left text-light"></i> Preview
            </button>
            {/* <button className="btn btn-warning rounded-circle"><i class="bi fs-4 fw-semibold bi-mic"></i></button> */}
            {testDetails.examType === "Theory" && (
              <div>
                <button className={`btn rounded-circle ${listening ? "btn-danger" : "btn-warning"}`}
                  onClick={() => { listening ? stopVoiceTyping() : startVoiceTyping(); }} >
                  <i className={`bi fs-4 fw-semibold ${listening ? "bi-mic-mute" : "bi-mic"}`} ></i>
                </button>
                <button className="btn btn-primary" onClick={() => setShowMathKeyboard(true)} >
                  π
                </button>
              </div>
            )}
            <button className="btn btn-primary" onClick={next}>
              Next <i class="ps-1 fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
        <div className="col-md-5 p-4">
          <p><b>Candidate:</b> {loggedUser?.name}</p>
          <div className={`col-4 p-2 rounded text-center ${timeLeft <= 120 ? "bg-danger text-white" : "bg-warning"}`} >
            <b>Time Left</b>
            <div>{formatTime(timeLeft)}</div>
          </div>
          <p className="mt-3">
            <b>Total Questions:</b> {questions.length}
          </p>
          <div className="d-flex flex-wrap gap-2 mt-3">
            {questions.map((q, i) => {
              const isCurrent = i === index;
              const isAttempted = answers[q.queId];
              return (
                <button
                  key={i}
                  onClick={() => {
                    stopVoiceTyping();
                    setIndex(i);
                  }}
                  // onClick={() => setIndex(i)}
                  disabled={submitted}
                  className={`btn
                    ${isCurrent
                      ? "btn-warning"
                      : isAttempted
                        ? "btn-success text-white"
                        : "btn-outline-dark"
                    }`} >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="row d-flex justify-content-center align-items-center py-3">
        <div className="col-md-5 text-center">
          <button className="btn btn-success me-2" onClick={() => setShowSubmitConfirm(true)}>
            Submit Exam
          </button>
        </div>
      </div>
      {showSubmitConfirm && (
        <div className="modal-backdrop d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(0,0,0,0.85)", position: "fixed", inset: 0, zIndex: 99999
          }}>
          <div className="bg-white p-4 rounded-3" style={{ width: "380px" }}>
            <h5 className="text-center text-dark">Confirm Exam Submission</h5>
            <p className="text-center mt-2">
              Are you sure you want to submit the exam?
              Once submitted, you cannot change your answers.
            </p>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button className="btn btn-success" onClick={() => { setShowSubmitConfirm(false); submitExam(); }}>
                Yes
              </button>
              <button className="btn btn-danger" onClick={() => setShowSubmitConfirm(false)} >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="modal show d-block" style={{ background: "#00000090" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-check-circle-fill me-2"></i> Success
                </h5>
                {/* <button type="button" className="btn-close btn-close-white"
                  onClick={() => setShowSuccessModal(false)} ></button> */}
              </div>
              <div className="modal-body text-center py-4 d-flex justify-content-center align-items-center flex-column">
                <svg xmlns="http://www.w3.org/2000/svg" className="text-success mb-3" width="60" height="60" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 11.001 8a8 8 0 0115.999 0zM6.97 11.03a.75.75 0 001.06 0l4.992-4.992a.75.75 0 10-1.06-1.06L7.5 9.939 4.53 6.97a.75.75 0 10-1.06 1.06l3.5 3.5z" />
                </svg>
                <h5 className="fw-semibold text-dark">{successMessage}</h5>
              </div>
              <div className="modal-footer border-0 justify-content-center">
                <button type="button" className="btn btn-success px-4"
                  onClick={() => { setShowSuccessModal(false); navigate("/"); }} >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMathKeyboard && (
        <div
          style={{ position: "fixed", bottom: "20px", right: "20px", background: "#fff", border: "2px solid #000", borderRadius: "10px", padding: "15px", zIndex: 99999, width: "90%", maxWidth: "500px", boxShadow: "0px 0px 10px rgba(0,0,0,0.5)" }} >
          <div className="d-flex justify-content-between mb-2">
            <b>Math Keyboard</b>
            <button className="btn btn-sm btn-danger" onClick={() => setShowMathKeyboard(false)} >
              Close
            </button>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {mathSymbols.map((sym, i) => (
              <button key={i} className="btn btn-outline-dark" onClick={() => addMathSymbol(sym)} >
                {sym}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default Exam;
