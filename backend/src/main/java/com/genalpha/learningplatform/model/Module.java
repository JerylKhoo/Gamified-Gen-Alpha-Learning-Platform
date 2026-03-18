package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "module")
public class Module {

    @Id
    @Column(name = "module_id")
    private String moduleId;

    @Column(name = "course_id", nullable = false)
    private String courseId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String content;

    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
