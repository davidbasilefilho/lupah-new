"use node";
/**
 * Convex actions for student operations that require Node.js runtime
 * These handle operations involving bcrypt password hashing
 */

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { generateAccessCode, isValidAccessCodeFormat } from "./lib/crypto";

/**
 * Creates a new student with encrypted access code
 * This runs in Node.js runtime to use bcrypt
 */
export const createStudent = action({
  args: {
    name: v.string(),
    dateOfBirth: v.string(),
    enrollmentDate: v.string(),
    grade: v.string(),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("graduated"),
      ),
    ),
    notes: v.optional(v.string()),
    intelligenceTypes: v.optional(
      v.array(
        v.union(
          v.literal("logico-matematica"),
          v.literal("verbo-linguistica"),
          v.literal("linguagens"),
          v.literal("espacial"),
          v.literal("corporal-cinestesica"),
          v.literal("musical"),
          v.literal("interpessoal"),
          v.literal("intrapessoal"),
          v.literal("naturalista"),
          v.literal("existencial"),
          v.literal("memoria"),
          v.literal("espiritual"),
        ),
      ),
    ),
  },
  handler: async (ctx, args): Promise<{ studentId: any; accessCode: string; message: string }> => {
    // Generate access code
    const accessCode = generateAccessCode();

    // Hash the access code using internal action
    const accessCodeHash: string = await ctx.runAction(
      (internal as any)["lib/cryptoActions"].hashAccessCodeAction,
      { accessCode }
    );

    // Insert student into database
    const studentId: any = await ctx.runMutation(internal.students.internalCreateStudent, {
      name: args.name,
      dateOfBirth: args.dateOfBirth,
      enrollmentDate: args.enrollmentDate,
      grade: args.grade,
      status: args.status || "active",
      notes: args.notes,
      accessCodeHash,
      intelligenceTypes: args.intelligenceTypes || [],
    });

    return {
      studentId,
      accessCode,
      message: "Aluno criado com sucesso.",
    };
  },
});

/**
 * Regenerates access code for a student
 * This runs in Node.js runtime to use bcrypt
 */
export const regenerateAccessCode = action({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, args): Promise<{ accessCode: string; message: string }> => {
    // Check if student exists
    const student: any = await ctx.runQuery(internal.students.internalGetStudent, {
      studentId: args.studentId,
    });

    if (!student) {
      throw new Error("Aluno não encontrado.");
    }

    // Generate new access code
    const newAccessCode = generateAccessCode();

    // Hash the new access code
    const newAccessCodeHash: string = await ctx.runAction(
      (internal as any)["lib/cryptoActions"].hashAccessCodeAction,
      { accessCode: newAccessCode }
    );

    // Update student with new hash
    await ctx.runMutation(internal.students.internalUpdateAccessCode, {
      studentId: args.studentId,
      accessCodeHash: newAccessCodeHash,
    });

    return {
      accessCode: newAccessCode,
      message: "Código de acesso regenerado com sucesso.",
    };
  },
});

/**
 * Validates student access code and returns student data
 * This runs in Node.js runtime to use bcrypt
 */
export const validateStudentAccessCode = action({
  args: {
    accessCode: v.string(),
  },
  handler: async (ctx, args): Promise<{ student: any; currentDocument: any | null }> => {
    if (!isValidAccessCodeFormat(args.accessCode)) {
      throw new Error(
        "Formato de código inválido. Use 8 caracteres alfanuméricos.",
      );
    }

    // Get all students
    const students: any[] = await ctx.runQuery(internal.students.internalListAllStudents);

    // Check each student's hash
    for (const student of students) {
      const isValid: boolean = await ctx.runAction(
        (internal as any)["lib/cryptoActions"].validateAccessCodeAction,
        {
          accessCode: args.accessCode,
          storedHash: student.accessCodeHash,
        }
      );

      if (isValid && student.status === "active") {
        // Get current document for this student
        const currentDocument: any = await ctx.runQuery(
          internal.students.internalGetCurrentDocument,
          { studentId: student._id }
        );

        return {
          student: {
            _id: student._id,
            name: student.name,
            dateOfBirth: student.dateOfBirth,
            grade: student.grade,
            status: student.status,
            intelligenceTypes: student.intelligenceTypes,
            notes: student.notes,
          },
          currentDocument: currentDocument
            ? {
                _id: currentDocument._id,
                storageId: currentDocument.storageId,
                fileName: currentDocument.fileName,
                fileSize: currentDocument.fileSize,
                uploadDate: currentDocument.uploadDate,
                notes: currentDocument.notes,
              }
            : null,
        };
      }
    }

    throw new Error("Código de acesso inválido ou aluno inativo.");
  },
});
