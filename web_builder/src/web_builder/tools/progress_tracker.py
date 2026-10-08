import json
import re
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

AGENT_ROLES = [
    ("Business Analyst", "Design Analysis & Technical Blueprint", "ba"),
    ("Backend Engineer", "Spring Boot Architecture & REST APIs", "backend"),
    ("Frontend Engineer", "React & Stitch UI Implementation", "frontend"),
    ("QA Engineer", "Codebase Health & Quality Verification", "qa"),
]


class ProgressTracker:
    def __init__(self, total_tasks: int = 4, process_name: str = "sequential"):
        self.total_tasks = total_tasks
        self.process_name = process_name
        self.target_phase = "Phase 0: Kh\u1edfi T\u1ea1o Monorepo, Backend Spring Boot & Frontend Setup"
        self.phase_id = "0"
        self.phase_file = "plans/phases/PHASE_0_SETUP.md"
        self.subtasks: List[Dict[str, Any]] = []
        self.completed_tasks: List[Dict[str, Any]] = []
        self.step_count = 0
        self.start_time = time.time()
        self.task_start_time = time.time()
        self.output_dir = Path("output")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.json_file = self.output_dir / "progress.json"
        self.md_file = self.output_dir / "progress.md"

        self._load_phase_subtasks()
        self._update_files(status="INITIALIZED", current_task_name="Pipeline starting...")

    def set_phase_context(self, target_phase: str, phase_id: str = "0", phase_file: str = ""):
        self.target_phase = target_phase
        self.phase_id = str(phase_id)
        if phase_file:
            self.phase_file = phase_file
        self._load_phase_subtasks()
        self._update_files(status="RUNNING", current_task_name=f"Starting {target_phase}")

    def _load_phase_subtasks(self):
        self.subtasks = []
        target_path = Path(self.phase_file) if self.phase_file else None
        if target_path and target_path.exists():
            try:
                with open(target_path, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()

                matches = re.finditer(r"^###\s+(Task\s+[\d\.]+)[:\s\-]+([^\r\n]+)", content, re.MULTILINE)
                for m in matches:
                    task_id = m.group(1).strip()
                    task_title = m.group(2).strip()

                    section_start = m.end()
                    next_section = content.find("### Task", section_start)
                    section_body = content[section_start:next_section] if next_section != -1 else content[section_start:]

                    files_match = re.search(r"-\s*\*\*Files?\*\*:\s*([^\r\n]+)", section_body)
                    files_list = []
                    if files_match:
                        raw_files = files_match.group(1).replace("`", "").split(",")
                        for rf in raw_files:
                            clean_rf = rf.strip().strip("'\"").rstrip(".,;:)")
                            if clean_rf and not clean_rf.endswith("..."):
                                files_list.append(clean_rf)

                    all_exist = False
                    if files_list:
                        def _check_file_exists(f_path: str) -> bool:
                            p = Path(f_path)
                            if p.exists() and p.stat().st_size > 0:
                                return True
                            if f_path.startswith(('controller/', 'service/', 'repository/', 'entity/', 'dto/', 'config/', 'exception/', 'security/')):
                                java_base = Path('backend/src/main/java')
                                if java_base.exists():
                                    for match in java_base.glob(f"**/{f_path}"):
                                        if match.exists() and match.stat().st_size > 0:
                                            return True
                            return False
                        all_exist = all(_check_file_exists(f) for f in files_list)

                    self.subtasks.append({
                        "id": task_id,
                        "title": task_title,
                        "files": files_list,
                        "completed": all_exist,
                    })
            except Exception:
                pass

    def _get_all_phases_roadmap(self) -> List[Dict[str, Any]]:
        phases_dir = Path("plans/phases")
        if not phases_dir.exists():
            phases_dir = Path(__file__).resolve().parents[4] / "plans" / "phases"

        roadmap = []
        if phases_dir.exists():
            for pf in sorted(phases_dir.glob("PHASE_*.md")):
                try:
                    with open(pf, "r", encoding="utf-8", errors="replace") as f:
                        fc = f.read()
                    first_line = fc.splitlines()[0].strip("# \t\r\n") if fc else pf.stem
                    m = re.search(r"PHASE_([A-Za-z0-9]+)", pf.name)
                    pid = m.group(1) if m else "\u2588"
                    tasks = re.findall(r"^###\s+Task\s+[\d\.]+", fc, re.MULTILINE)

                    # Extract Key Files
                    key_files = []
                    for fm in re.finditer(r"-\s*\*\*Files?\*\*:\s*([^\r\n]+)", fc):
                        for rf in fm.group(1).replace("`", "").split(","):
                            clean_rf = rf.strip().strip("'\"").rstrip(".,;:)")
                            if clean_rf and clean_rf not in key_files:
                                key_files.append(clean_rf)

                    # Status
                    if str(self.phase_id) == str(pid):
                        st = "\u23F3 Active"
                    elif key_files and all(Path(kf).exists() and Path(kf).stat().st_size > 0 for kf in key_files[:2]):
                        st = "\u2705 Completed"
                    else:
                        st = "\u26AA Pending"

                    roadmap.append({
                        "id": pid,
                        "title": first_line,
                        "task_count": len(tasks),
                        "status": st,
                    })
                except Exception:
                    pass
        return roadmap

    def _render_progress_bar(self, percent: int, width: int = 25) -> str:
        filled = int(width * (percent / 100.0))
        empty = width - filled
        return "\u2588" * filled + "\u2591" * empty

    def _format_time(self, seconds: float) -> str:
        mins, secs = divmod(int(seconds), 60)
        return f"{mins}m {secs:02d}s" if mins > 0 else f"{secs}s"

    def _update_files(self, status: str, current_task_name: str = ""):
        completed_count = len(self.completed_tasks)
        percent = int((completed_count / self.total_tasks) * 100) if self.total_tasks > 0 else 0
        elapsed = time.time() - self.start_time

        for st in self.subtasks:
            if st.get("files"):
                st["completed"] = all(Path(f).exists() and Path(f).stat().st_size > 0 for f in st["files"])

        roadmap = self._get_all_phases_roadmap()

        data = {
            "status": status,
            "process": self.process_name,
            "target_phase": self.target_phase,
            "phase_id": self.phase_id,
            "phase_subtasks": self.subtasks,
            "completed_agent_tasks": completed_count,
            "total_agent_tasks": self.total_tasks,
            "progress_percent": percent,
            "current_step": self.step_count,
            "current_task": current_task_name,
            "elapsed_seconds": round(elapsed, 1),
            "elapsed_formatted": self._format_time(elapsed),
            "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "agent_tasks": self.completed_tasks,
            "phases_roadmap": roadmap,
        }

        try:
            with open(self.json_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception:
            pass

        try:
            bar = self._render_progress_bar(percent, 25)
            lines = [
                "# 🚀 Autonomous Software Engineering - Live Progress Tracker",
                "",
                f"- **Target Phase:** `{self.target_phase}`",
                f"- **Process Mode:** `{self.process_name.upper()}` (BA -> Backend -> Frontend -> QA)",
                f"- **Status:** `{status}`",
                f"- **Overall Pipeline Progress:** `[{bar}] {percent}%` ({completed_count}/{self.total_tasks} Agent Milestones)",
                f"- **Total Agent Steps:** {self.step_count}",
                f"- **Elapsed Time:** {self._format_time(elapsed)}",
                f"- **Last Updated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                "",
                "---",
                "",
            ]

            if self.subtasks:
                lines.append(f"### \U0001F4CB Phase {self.phase_id} Checklist & Work Breakdown")
                for st in self.subtasks:
                    mark = "[x]" if st["completed"] else "[ ]"
                    files_hint = f" *(Files: {', '.join(st['files'])})*" if st.get("files") else ""
                    status_tag = " \u2705 Done" if st["completed"] else ""
                    lines.append(f"- {mark} **{st['id']}**: {st['title']}{files_hint}{status_tag}")
                lines.append("")
                lines.append("---")
                lines.append("")

            lines.extend([
                "### \U0001F916 CrewAI Agent Milestones",
                "| # | Agent Role | Task Description | Duration | Status |",
                "|---|------------|------------------|----------|--------|",
            ])

            for idx, (role_name, role_desc, role_key) in enumerate(AGENT_ROLES[:self.total_tasks], start=1):
                completed_match = next((t for t in self.completed_tasks if t.get("index") == idx), None)
                if completed_match:
                    dur = self._format_time(completed_match.get("duration", 0))
                    lines.append(f"| {idx} | {role_name} | {role_desc} | {dur} | ? Completed |")
                elif idx == completed_count + 1 and status in ("RUNNING", "INITIALIZED"):
                    lines.append(f"| {idx} | {role_name} | {role_desc} | - | \u23F3 Running |")
                else:
                    lines.append(f"| {idx} | {role_name} | {role_desc} | - | \u23F8 Queued |")

            lines.append("")
            lines.append("---")
            lines.append("")

            if roadmap:
                lines.extend([
                    "### \U0001F5FA Project 10-Phase Roadmap",
                    "| Phase | Milestone | Subtasks | Status |",
                    "|-------|-----------|----------|--------|",
                ])
                for pm in roadmap:
                    lines.append(f"| **Phase {pm['id']}** | {pm['title']} | {pm['task_count']} subtasks | {pm['status']} |")

            with open(self.md_file, "w", encoding="utf-8") as f:
                f.write("\n".join(lines) + "\n")
        except Exception:
            pass

    def on_step(self, step_output: Any):
        self.step_count += 1
        elapsed = time.time() - self.start_time
        tool_name = "Step action"
        if hasattr(step_output, "tool"):
            tool_name = f"Tool '{step_output.tool}'"
        elif isinstance(step_output, tuple) and len(step_output) > 0 and hasattr(step_output[0], "tool"):
            tool_name = f"Tool '{step_output[0].tool}'"
        elif isinstance(step_output, dict) and "tool" in step_output:
            tool_name = f"Tool '{step_output['tool']}'"

        print(f"  [? Step #{self.step_count:02d} | {self._format_time(elapsed)}] Executing: {tool_name}")
        self._update_files(status="RUNNING")

    def on_task_completed(self, task_output: Any):
        task_duration = time.time() - self.task_start_time
        self.task_start_time = time.time()

        agent_role = getattr(task_output, "agent", "Unknown Agent")
        if isinstance(agent_role, str):
            agent_role = agent_role.split("\n")[0].strip()

        task_name = getattr(task_output, "name", None)
        if not task_name:
            task_desc = getattr(task_output, "description", "")
            first_line = task_desc.strip().split("\n")[0] if task_desc else f"Task {len(self.completed_tasks) + 1}"
            task_name = first_line[:50] + ("..." if len(first_line) > 50 else "")

        task_entry = {
            "index": len(self.completed_tasks) + 1,
            "name": task_name,
            "agent": agent_role,
            "duration": round(task_duration, 2),
            "completed_at": datetime.now().strftime("%H:%M:%S"),
        }
        self.completed_tasks.append(task_entry)

        completed_count = len(self.completed_tasks)
        percent = int((completed_count / self.total_tasks) * 100) if self.total_tasks > 0 else 0
        elapsed = time.time() - self.start_time
        bar = self._render_progress_bar(percent, 25)

        print("\n" + "\u2588" * 72)
        print(f" 🚀 PROGRESS MILESTONE: [{bar}] {percent}% ({completed_count}/{self.total_tasks} Tasks)")
        print(f"    [?] Completed : {task_name}")
        print(f"    [?] Agent     : {agent_role}")
        print(f"    [⏱️] Task Time : {self._format_time(task_duration)} (Total Elapsed: {self._format_time(elapsed)})")
        print("\u2588" * 72 + "\n")

        self._update_files(status="RUNNING" if percent < 100 else "FINISHED", current_task_name=task_name)

    def finish(self):
        total_time = time.time() - self.start_time
        self._update_files(status="COMPLETED")
        
        # Auto-archive coding_team_report.md to output/reports/
        try:
            report_src = self.output_dir / "coding_team_report.md"
            if report_src.exists() and report_src.stat().st_size > 0:
                reports_dir = self.output_dir / "reports"
                reports_dir.mkdir(parents=True, exist_ok=True)
                clean_name = re.sub(r'[^\w\-_.]', '_', self.target_phase or "phase").strip('_')
                clean_name = re.sub(r'_+', '_', clean_name)[:60]
                t_stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                dst_report = reports_dir / f"report_{clean_name}_{t_stamp}.md"
                import shutil
                shutil.copy2(report_src, dst_report)
        except Exception:
            pass
        bar = self._render_progress_bar(100, 25)
        print("\n" + "\u2588" * 72)
        print(f" 🎉 MISSION COMPLETED: [{bar}] 100%")
        print(f"    Total Tasks Completed : {len(self.completed_tasks)}/{self.total_tasks}")
        print(f"    Total Agent Steps     : {self.step_count}")
        print(f"    Total Pipeline Time   : {self._format_time(total_time)}")
        print(f"    Progress Files Saved  : {self.json_file.as_posix()} | {self.md_file.as_posix()}")
        print("\u2588" * 72 + "\n")

    def fail(self, error_message: str = "Build validation failed"):
        total_time = time.time() - self.start_time
        self._update_files(status="FAILED_NEEDS_HUMAN", current_task_name=f"Failed: {error_message[:60]}")
        print("\n" + "!" * 72)
        print(f" ❌ PIPELINE FAILED: {error_message}")
        print(f"    Total Pipeline Time   : {self._format_time(total_time)}")
        print(f"    Progress Files Saved  : {self.json_file.as_posix()} | {self.md_file.as_posix()}")
        print("!" * 72 + "\n")


progress_tracker = ProgressTracker(total_tasks=4)


def global_step_callback(step_output: Any):
    progress_tracker.on_step(step_output)


def global_task_callback(task_output: Any):
    progress_tracker.on_task_completed(task_output)
