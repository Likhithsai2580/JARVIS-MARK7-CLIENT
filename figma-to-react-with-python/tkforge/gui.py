# Code generated by TkForge <https://github.com/axorax/tkforge>
# Donate to support TkForge! <https://www.patreon.com/axorax>

import os
import sys
import random
import threading
import webbrowser
import tkinter as tk
from tk import tk_code
from utils import extract_figma_id, has_update
from tkinter import filedialog, messagebox

def load_asset(path):
    base = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    assets = os.path.join(base, "assets")
    return os.path.join(assets, path)

root = tk.Tk()
root.geometry("750x500")
root.configure(bg="#ffffff")
root.title("TkForge")
icon_image = tk.PhotoImage(file=load_asset("icon.png"))
root.iconphoto(True, icon_image)

current_gui = "main"
main_gui = tk.Frame(root)
main_gui.pack(fill=tk.BOTH, expand=True)
progress_gui = tk.Frame(root)
progress_gui.pack_forget()

placeholders = [
    "Your Figma token",
    "Figma file URL or just ID",
    "Output path or leave blank to use current directory"
]

def toggle_gui():
    global current_gui
    if current_gui == "main":
        main_gui.pack_forget()
        progress_gui.pack(fill=tk.BOTH, expand=True)
        current_gui = "progress"
    else:
        progress_gui.pack_forget()
        main_gui.pack(fill=tk.BOTH, expand=True)
        current_gui = "main"

# Canvas

progress_canvas = tk.Canvas(
    progress_gui,
    bg = "#ffffff",
    width = 750,
    height = 500,
    bd = 0,
    highlightthickness = 0,
    relief = "ridge"
)

progress_canvas.place(x=0, y=0)

main_canvas = tk.Canvas(
    main_gui,
    bg = "#ffffff",
    width = 750,
    height = 500,
    bd = 0,
    highlightthickness = 0,
    relief = "ridge"
)

main_canvas.place(x=0, y=0)

# Layout

background = tk.PhotoImage(file=load_asset(f"backgrounds/{random.randint(1, 5)}.png"))

main_canvas.create_image(167, 250, image=background)

progress_canvas.create_image(167, 250, image=background)

progress_layout = tk.PhotoImage(file=load_asset("image_5.png"))

progress_canvas.create_image(392, 253, image=progress_layout)

main_layout = tk.PhotoImage(file=load_asset("image_1.png"))

main_canvas.create_image(383, 253, image=main_layout)

# Placeholder code

class TkForge_Entry(tk.Entry):
    def __init__(self, master=None, placeholder="Enter text", placeholder_fg='grey', **kwargs):
        super().__init__(master, **kwargs)
        
        self.p, self.p_fg, self.fg = placeholder, placeholder_fg, self.cget("fg")
        self.putp()
        self.bind("<FocusIn>", self.toggle)
        self.bind("<FocusOut>", self.toggle)

    def putp(self):
        self.delete(0, tk.END)
        self.insert(0, self.p)
        self.config(fg=self.p_fg)
        self.p_a = True

    def toggle(self, event):
        if self.p_a:
            self.delete(0, tk.END)
            self.config(fg=self.fg)
            self.p_a = False
        elif not self.get(): self.putp()

    def get(self): return '' if self.p_a else super().get()

    def is_placeholder(self, b):
        self.p_a = b
        self.config(fg=self.p_fg if b == True else self.fg)

    def get_placeholder(self): return self.p


# Figma token input

token_input = TkForge_Entry(
    main_gui,
    bd=0,
    bg="#f5f5f5",
    fg="#000",
    highlightthickness=0,
    placeholder=placeholders[0]
)

token_input.place(x=376, y=109, width=331, height=28)

# File URL input

file_input = TkForge_Entry(
    main_gui,
    bd=0,
    bg="#f5f5f5",
    fg="#000",
    highlightthickness=0,
    placeholder=placeholders[1]
)

file_input.place(x=376, y=191, width=331, height=28)

# Output path textbox

outpath_input = TkForge_Entry(
    main_gui,
    bd=0,
    bg="#f5f5f5",
    fg="#000",
    highlightthickness=0,
    placeholder=placeholders[2]
)

outpath_input.place(x=376, y=272, width=299, height=28)

# Generate code

def clear_token_input(t=True):
    token_input.delete(0, tk.END)
    if t:
        token_input.is_placeholder(True)
        token_input.insert(0, token_input.get_placeholder())

def clear_file_input(t=True):
    file_input.delete(0, tk.END)
    if t:
        file_input.is_placeholder(True)
        file_input.insert(0, file_input.get_placeholder())

def generate():
    token = token_input.get().strip().replace(' ', '')
    file = file_input.get().strip().replace(' ', '')
    output = outpath_input.get()

    def generate_code_threaded():
        nonlocal token, file, output
        if token == "" or token in placeholders:
            clear_token_input(False)
            token_input.is_placeholder(False)
            token_input.insert(0, "THIS IS REQUIRED")
            root.after(1500, clear_token_input)
            return

        if file == "" or file in placeholders:
            clear_file_input(False)
            file_input.is_placeholder(False)
            file_input.insert(0, "THIS IS REQUIRED")
            root.after(1500, clear_file_input)
            return
        
        if output == '':
            if os.path.exists('TkForge'):
                response = messagebox.askyesno("Directory Already Exists", "The folder 'TkForge' already exists. Do you want to override it?")
                if not response:
                    return
        else:
            if os.path.exists(os.path.join(output, 'TkForge')):
                response = messagebox.askyesno("Directory Already Exists", f"The folder 'TkForge' in the directory '{output}' already exists. Do you want to override it?")
                if not response:
                    return
            
        toggle_gui()
        code = tk_code(extract_figma_id(file), token, output)

        if code == None:
            messagebox.showerror('Invalid token or file', 'The file ID, token or output path that you provided is invalid!')
            toggle_gui()
        elif code == True:
            messagebox.showinfo('Success', 'Your code has been generated!')
            toggle_gui()

    thread = threading.Thread(target=generate_code_threaded)
    thread.start()

# Generate button

generate_button_image = tk.PhotoImage(file=load_asset("image_3.png"))

generate_button = tk.Button(
    main_gui,
    image=generate_button_image,
    relief="flat",
    borderwidth=0,
    highlightthickness=0,
    command=generate
)

generate_button.place(x=372, y=328, width=339, height=38)

# Output path selection

def select_outpath():
    path = filedialog.askdirectory()
    if path:
        outpath_input.delete(0, tk.END)
        outpath_input.is_placeholder(False)
        outpath_input.insert(0, path)

# Output path button

outpath_button_image = tk.PhotoImage(file=load_asset("image_2.png"))

outpath_button = tk.Button(
    main_gui,
    image=outpath_button_image,
    relief="flat",
    borderwidth=0,
    highlightthickness=0,
    command=select_outpath
)

outpath_button.place(x=685, y=273, width=24, height=27)

# Donate button

donate_button_image = tk.PhotoImage(file=load_asset("image_4.png"))

donate_button = tk.Button(
    main_gui,
    image=donate_button_image,
    relief="flat",
    borderwidth=0,
    highlightthickness=0,
    command=lambda: webbrowser.open("https://www.patreon.com/axorax")
)

donate_button.place(x=371, y=446, width=343, height=34)

update = has_update()
if update == True:
    messagebox.showinfo('New update!', "Update your version of TkForge to get the latest features! https://github.com/axorax/tkforge/releases")

root.resizable(False, False)
root.mainloop()